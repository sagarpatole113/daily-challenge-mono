import json, time, base64, datetime as dt, re

def b64(d): return base64.urlsafe_b64encode(json.dumps(d).encode()).rstrip(b"=").decode()
def fake_jwt(uid="uid1", email="sagar_p@mpscdaily.local"):
    now=int(time.time())
    return f"{b64({'alg':'RS256','typ':'JWT','kid':'k'})}.{b64({'iss':'https://securetoken.google.com/fake-proj','aud':'fake-proj','auth_time':now,'user_id':uid,'sub':uid,'iat':now,'exp':now+3600,'email':email,'firebase':{'identities':{'email':[email]},'sign_in_provider':'password'}})}.sig"
TOKEN=fake_jwt()
IST=dt.timezone(dt.timedelta(hours=5,minutes=30))
def today(): return dt.datetime.now(IST).strftime("%Y-%m-%d")
def iso(t): return dt.datetime.fromtimestamp(t,dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.")+f"{int((t%1)*1000):03d}Z"

class Mock:
    def __init__(self, short_expiry_test=2, short_secs=8, skew=3.0):
        self.day=today(); self.completed=[]; self.attempts={}; self.in_progress={}
        self.short_test=short_expiry_test; self.short_secs=short_secs; self.skew=skew
        self.log=[]; self.auth_ok=True; self.fail_answers=False
        self.stats=dict(totalTestsCompleted=0,totalQuestionsAttempted=0,totalCorrectAnswers=0,totalWrongAnswers=0,totalScore=0,bestScore=0)
        self.questions=[{"id":f"q{i}","questionNumber":i,"questionEnglish":f"English question {i}?","questionMarathi":f"मराठी प्रश्न {i}?",
          "options":[{"id":c,"english":f"Option {c} for {i}","marathi":f"पर्याय {c} प्र.{i}"} for c in "ABCD"]} for i in range(1,101)]
        self.correct={f"q{i}":"ABCD"[(i-1)%4] for i in range(1,101)}
        prev=lambda n:(dt.datetime.now(IST)-dt.timedelta(days=n)).strftime("%Y-%m-%d")
        self.prev_days=[(prev(1),3),(prev(2),1)]
    def tid(self,n): return f"{self.day}_t{n}"
    def unlocked_upto(self): return min(len(self.completed)+1,3)
    def tests(self):
        out=[]
        for n in (1,2,3):
            c=self.tid(n) in self.completed
            ip=n in self.in_progress.values() if False else any(a["testNumber"]==n and a["status"]=="IN_PROGRESS" for a in self.attempts.values())
            att=next((a["id"] for a in self.attempts.values() if a["testNumber"]==n),None)
            out.append({"id":self.tid(n),"dayId":self.day,"testNumber":n,"title":f"Test {n}","totalQuestions":100,"totalMarks":100,"durationMinutes":60,"negativeMarking":0.25,"status":"ACTIVE","createdAt":"2026-01-01T00:00:00.000Z",
              "locked":n>self.unlocked_upto(),"unlocked":n<=self.unlocked_upto(),"completed":c,"inProgress":ip and not c,**({"attemptId":att} if att else {})})
        return out
    def finalize(self,a,status):
        if a["status"]!="IN_PROGRESS": return
        c=w=u=0
        for q in self.questions:
            s=a["answers"].get(q["id"],{}).get("selectedOptionId")
            if not s: u+=1
            elif s==self.correct[q["id"]]: c+=1
            else: w+=1
        score=round(c-w*0.25,2); acc=round(c/(c+w)*100,2) if c+w else 0
        a.update(status=status,score=score,correctAnswers=c,wrongAnswers=w,unansweredQuestions=u,accuracy=acc,
                 timeTakenSeconds=int(min(time.time(),a["_exp"])-a["_start"]),submittedAt=iso(time.time()))
        self.completed.append(a["testId"])
        s=self.stats; s["totalTestsCompleted"]+=1; s["totalQuestionsAttempted"]+=100; s["totalCorrectAnswers"]+=c; s["totalWrongAnswers"]+=w; s["totalScore"]+=score; s["bestScore"]=max(s["bestScore"],score)
    def result(self,a): return {k:a[k] for k in ("testId","testNumber","dayId","status","score","correctAnswers","wrongAnswers","unansweredQuestions","accuracy","timeTakenSeconds","submittedAt")}|{"attemptId":a["id"]}
    def pub(self,a): return {k:v for k,v in a.items() if not k.startswith("_") and k!="answers"}

    def handle(self, method, path, headers, body):
        """returns (status, json)"""
        self.log.append((method,path,body))
        if path=="/health": return 200,{"success":True,"data":{"status":"ok","time":iso(time.time())}}
        if headers.get("authorization")!=f"Bearer {TOKEN}":
            self.auth_ok=False; return 401,{"success":False,"message":"Invalid or expired authentication token"}
        ok=lambda d:(200,{"success":True,"data":d,"message":""})
        err=lambda s,m:(s,{"success":False,"message":m})
        if path=="/users/me" and method=="GET":
            return ok({"id":"uid1","name":"Sagar Patole","username":"sagar_p","createdAt":"2026-09-01T00:00:00.000Z","updatedAt":"2026-09-01T00:00:00.000Z","lastActiveAt":"2026-10-20T00:00:00.000Z",**self.stats})
        if path=="/users/profile" and method=="POST": return ok({"id":"uid1","name":body["name"],"username":body.get("username","")})
        if path=="/days":
            days=[{"dayId":self.day,"date":self.day,"totalTests":3,"completedTests":len(self.completed),"currentUnlockedTest":self.unlocked_upto(),"status":"ACTIVE"}]
            days+=[{"dayId":d,"date":d,"totalTests":3,"completedTests":c,"currentUnlockedTest":3,"status":"ACTIVE"} for d,c in self.prev_days]
            return ok(days)
        m=re.fullmatch(r"/days/([\d-]+)/tests",path)
        if m: return ok(self.tests() if m.group(1)==self.day else [])
        m=re.fullmatch(r"/tests/([^/]+)/start",path)
        if m and method=="POST":
            tid=m.group(1); n=int(tid.split("_t")[1])
            if n>self.unlocked_upto(): return err(403,f"Test {n} is locked. Complete test {n-1} first.")
            ex=next((a for a in self.attempts.values() if a["testId"]==tid and a["status"]=="IN_PROGRESS"),None)
            if not ex:
                t=time.time(); dur=self.short_secs if n==self.short_test else 3600
                aid=f"att{len(self.attempts)+1}"
                ex={"id":aid,"userId":"uid1","dayId":self.day,"testId":tid,"testNumber":n,"status":"IN_PROGRESS","startedAt":iso(t),"expiresAt":iso(t+dur),"createdAt":iso(t),"answers":{},"_start":t,"_exp":t+dur}
                self.attempts[aid]=ex
            return ok({"attemptId":ex["id"],"startedAt":ex["startedAt"],"expiresAt":ex["expiresAt"],"durationMinutes":60,"questions":self.questions})
        m=re.fullmatch(r"/attempts/([^/]+)(?:/(answers|submit|expire|result|review))?",path)
        if m:
            a=self.attempts.get(m.group(1)); act=m.group(2)
            if not a: return err(404,"Attempt not found")
            if act is None:
                d=self.pub(a)
                if a["status"]=="IN_PROGRESS": d["answers"]=[{"questionId":k,"selectedOptionId":v["selectedOptionId"],"status":v["status"],"updatedAt":{"_seconds":1,"_nanoseconds":0}} for k,v in a["answers"].items()]
                return ok(d)
            if act=="answers":
                if self.fail_answers: return "ABORT",None
                if a["status"]!="IN_PROGRESS": return err(409,"Cannot modify answers on a completed attempt")
                if time.time()>a["_exp"]+self.skew: return err(409,"Attempt has expired")
                for k in ("questionId","status"):
                    if k not in body: return err(422,"Validation failed")
                if body["status"] not in ("NOT_VISITED","NOT_ANSWERED","ANSWERED","MARKED_FOR_REVIEW","ANSWERED_AND_MARKED"): return err(422,"Validation failed")
                a["answers"][body["questionId"]]={"selectedOptionId":body.get("selectedOptionId"),"status":body["status"]}
                return ok({"saved":True})
            if act=="submit":
                self.finalize(a,"TIME_EXPIRED" if time.time()>=a["_exp"]+self.skew else "COMPLETED"); return ok(self.result(a))
            if act=="expire":
                if a["status"]=="IN_PROGRESS" and time.time()<a["_exp"]+self.skew: return err(403,"Attempt has not yet expired. Use /submit to submit manually.")
                self.finalize(a,"TIME_EXPIRED"); return ok(self.result(a))
            if act=="result":
                if a["status"]=="IN_PROGRESS": return err(409,"Attempt is still in progress")
                return ok(self.result(a))
            if act=="review":
                if a["status"]=="IN_PROGRESS": return err(403,"Review available after completion")
                out=[]
                for q in self.questions:
                    s=a["answers"].get(q["id"],{}).get("selectedOptionId"); c=self.correct[q["id"]]
                    out.append({"questionNumber":q["questionNumber"],"questionEnglish":q["questionEnglish"],"questionMarathi":q["questionMarathi"],"options":q["options"],"selectedOptionId":s,"correctOptionId":c,"result":"UNANSWERED" if not s else ("CORRECT" if s==c else "WRONG"),"explanationEnglish":f"Because {c} is right for {q['questionNumber']}.","explanationMarathi":f"कारण {c} बरोबर आहे."})
                return ok(out)
        return err(404,"Not found: "+path)
