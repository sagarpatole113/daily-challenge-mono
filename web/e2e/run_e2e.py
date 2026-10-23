import json, os, re, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mock_api import Mock, TOKEN, today
from playwright.sync_api import sync_playwright, expect

BASE=os.environ.get("E2E_BASE","http://localhost:3100"); API=re.compile(r"^http://localhost:5001/")
mock=Mock(); results=[]; console_errors=[]
def check(name, cond, detail=""):
    results.append((bool(cond),name,detail)); print(("PASS " if cond else "FAIL ")+name+(f"  [{detail}]" if detail and not cond else ""))
CORS={"access-control-allow-origin":"*","access-control-allow-headers":"*","access-control-allow-methods":"GET,POST,OPTIONS"}

def install(ctx):
    def api(route):
        req=route.request
        if req.method=="OPTIONS": return route.fulfill(status=204,headers=CORS)
        path=req.url.split("localhost:5001",1)[1]; path=path.replace("/api/v1","",1) if path.startswith("/api/v1") else path
        body=json.loads(req.post_data) if req.post_data else None
        st,js=mock.handle(req.method,path.split("?")[0],{k.lower():v for k,v in req.headers.items()},body)
        if st=="ABORT": return route.abort("connectionrefused")
        route.fulfill(status=st,headers=CORS|{"content-type":"application/json"},body=json.dumps(js))
    def idt(route):
        u=route.request.url; email="sagar_p@mpscdaily.local"
        if "signInWithPassword" in u or "accounts:signUp" in u:
            js={"kind":"identitytoolkit#VerifyPasswordResponse","localId":"uid1","email":email,"displayName":"","idToken":TOKEN,"registered":True,"refreshToken":"rt","expiresIn":"3600"}
        elif "accounts:lookup" in u:
            js={"kind":"identitytoolkit#GetAccountInfoResponse","users":[{"localId":"uid1","email":email,"emailVerified":False,"providerUserInfo":[{"providerId":"password","federatedId":email,"email":email,"rawId":email}],"validSince":"1","lastLoginAt":"1","createdAt":"1"}]}
        else: js={}
        route.fulfill(status=200,headers=CORS|{"content-type":"application/json"},body=json.dumps(js))
    def tok(route):
        route.fulfill(status=200,headers=CORS|{"content-type":"application/json"},body=json.dumps({"access_token":TOKEN,"id_token":TOKEN,"refresh_token":"rt","expires_in":"3600","user_id":"uid1"}))
    ctx.route(API,api); ctx.route(re.compile(r"identitytoolkit\.googleapis\.com"),idt); ctx.route(re.compile(r"securetoken\.googleapis\.com"),tok)

def watch(page):
    page.on("console",lambda m: console_errors.append((page.url,m.text)) if m.type=="error" else None)
    page.on("pageerror",lambda e: console_errors.append((page.url,"PAGEERROR "+str(e))))
def timer_secs(page):
    t=page.locator("[role=timer]").inner_text().strip().split(":"); return int(t[0])*60+int(t[1])
def overflow(page): return page.evaluate("document.documentElement.scrollWidth - window.innerWidth")

SHOTS=os.environ.get("E2E_SHOTS","/tmp/shots"); os.makedirs(SHOTS,exist_ok=True)
with sync_playwright() as p:
    b=p.chromium.launch()
    # ---------- DESKTOP ----------
    ctx=b.new_context(viewport={"width":1280,"height":900}); install(ctx); page=ctx.new_page(); watch(page)
    page.goto(BASE+"/"); page.wait_for_load_state("networkidle")
    check("home renders hero h1", "Your Daily Practice" in page.locator("h1").inner_text())
    page.screenshot(path=f"{SHOTS}/home_desktop.png",full_page=False)
    page.screenshot(path=f"{SHOTS}/home_desktop_full.png",full_page=True)
    page.goto(BASE+"/mpsc-group-c/exam-pattern"); page.screenshot(path=f"{SHOTS}/guide_desktop.png")
    page.goto(BASE+"/dashboard"); page.wait_for_url(re.compile(r"/login\?next=%2Fdashboard"),timeout=10000)
    check("signed-out /dashboard redirects to /login?next=", "/login?next=%2Fdashboard" in page.url, page.url)
    page.screenshot(path=f"{SHOTS}/login.png")
    # login
    page.fill("#username","Sagar_P"); page.fill("#password","secret1"); page.click("button[type=submit]")
    page.wait_for_url(BASE+"/dashboard",timeout=15000); page.wait_for_selector("text=Welcome back, Sagar",timeout=15000)
    check("login -> dashboard greets with profile name", True)
    check("every API call carried the Firebase ID token as Bearer", mock.auth_ok)
    page.wait_for_selector("text=0 of 3",timeout=10000); page.wait_for_timeout(500)
    page.screenshot(path=f"{SHOTS}/dashboard.png",full_page=True)
    hrefs={h for h in page.locator('a[href^="/dashboard/test/"]').evaluate_all("els=>els.map(e=>e.getAttribute('href'))")}; check("only Test 1 is startable (locked tests have no link)", hrefs=={f"/dashboard/test/{mock.tid(1)}?day={mock.day}"}, str(hrefs))
    check("locked tests explain what unlocks them", page.locator("text=Finish Test 1 to unlock this one.").count()==1)
    # direct URL to locked test
    t2=mock.tid(2); page.goto(f"{BASE}/dashboard/test/{t2}?day={mock.day}"); page.wait_for_selector("text=This test is locked",timeout=10000)
    check("direct URL to locked test shows locked screen", True)
    check("no start request was sent for the locked test", not any(m=="POST" and p_.endswith(f"{t2}/start") for m,p_,_ in mock.log))
    # missing day param
    page.goto(f"{BASE}/dashboard/test/{mock.tid(1)}"); page.wait_for_selector("text=missing its day",timeout=8000); check("test URL without ?day shows a clear error", True)
    # ---------- TEST 1 ----------
    t1=mock.tid(1); page.goto(f"{BASE}/dashboard/test/{t1}?day={mock.day}"); page.wait_for_selector("text=Question 1 of 100",timeout=15000)
    check("test opens at server attempt, 100 questions", True)
    s0=timer_secs(page); check("countdown starts from server expiresAt (~60:00)", 3590<=s0<=3600, str(s0))
    check("English and Marathi both shown", page.locator("text=English question 1?").count()==1 and page.locator("text=मराठी प्रश्न 1?").count()==1)
    page.keyboard.press("a"); page.wait_for_timeout(250)
    page.keyboard.press("ArrowRight"); page.keyboard.press("c"); page.wait_for_timeout(250)   # Q2 wrong (correct B)
    page.keyboard.press("ArrowRight"); page.keyboard.press("c"); page.wait_for_timeout(250)   # Q3 correct
    page.keyboard.press("ArrowRight"); page.keyboard.press("m"); page.wait_for_timeout(250)   # Q4 marked
    page.keyboard.press("ArrowRight"); page.keyboard.press("a"); page.wait_for_timeout(250)   # Q5 answer then clear
    page.get_by_role("button",name="Clear response").click(); page.wait_for_timeout(500)
    posts=[b_ for m,p_,b_ in mock.log if m=="POST" and p_.endswith("/answers")]
    check("answer payloads match API contract", all(set(x)>= {"questionId","selectedOptionId","status"} for x in posts) and {"questionId":"q1","selectedOptionId":"A","status":"ANSWERED"} in posts, str(posts[:2]))
    check("clear sends selectedOptionId null + NOT_ANSWERED", {"questionId":"q5","selectedOptionId":None,"status":"NOT_ANSWERED"} in posts)
    check("mark sends MARKED_FOR_REVIEW", {"questionId":"q4","selectedOptionId":None,"status":"MARKED_FOR_REVIEW"} in posts)
    page.wait_for_selector("text=All answers saved",timeout=5000); check("sync badge shows All answers saved", True)
    page.screenshot(path=f"{SHOTS}/test_desktop.png")
    # reload mid-test
    page.wait_for_timeout(2500); before=timer_secs(page)
    page.reload(); page.wait_for_selector("text=Question 4 of 100",timeout=15000)
    after=timer_secs(page)
    check("reload resumes at first unanswered question (Q4)", True)
    check("timer NOT reset by reload (derived from server expiresAt)", after<=before and before-after<=15 and after<3600-1, f"before={before} after={after}")
    check("saved answers restored from server after reload", "answered" in (page.locator('button[aria-label^="Question 1,"]').get_attribute("aria-label") or "") and "marked" in (page.locator('button[aria-label^="Question 4,"]').get_attribute("aria-label") or ""))
    # submit
    page.get_by_role("button",name="Submit",exact=True).click(); page.wait_for_selector("text=Submit this test?")
    dlg=page.locator("dialog[open]").inner_text(); check("submit dialog shows 3 answered / 97 unanswered / 1 marked", "3" in dlg and "97" in dlg and "Marked" in dlg, dlg[:120])
    page.screenshot(path=f"{SHOTS}/submit_dialog.png")
    page.get_by_role("button",name="Submit test").click(); page.wait_for_url(re.compile(r"/dashboard/result/att1"),timeout=15000); page.wait_for_selector("text=Test 1 complete",timeout=10000)
    body=page.inner_text("main"); page.wait_for_timeout(1200)
    check("result shows server score 1.75", "1.75" in body, body[:200]); check("result shows 2 correct / 1 incorrect / 97 unanswered", all(x in body for x in ["97","66.67%"]))
    check("result offers Continue with Test 2", page.locator("text=Continue with Test 2").count()==1)
    page.screenshot(path=f"{SHOTS}/result.png",full_page=True)
    # review
    page.get_by_role("link",name="Review answers").click(); page.wait_for_selector("text=Review your answers",timeout=10000)
    check("review filters show counts", all(x in page.inner_text("main") for x in ["Wrong (1)","Unanswered (97)","Correct (2)"]))
    page.get_by_role("tab",name=re.compile("Wrong")).click(); page.locator("summary:has-text('Explanation')").first.click(); page.wait_for_timeout(300)
    check("review shows correct answer + bilingual explanation", page.locator("text=Correct answer").count()>=1 and page.locator("text=कारण").count()>=1)
    page.screenshot(path=f"{SHOTS}/review.png")
    # completed test cannot be restarted
    n_before=len([1 for m,p_,_ in mock.log if p_.endswith("/start")])
    page.goto(f"{BASE}/dashboard/test/{t1}?day={mock.day}"); page.wait_for_url(re.compile(r"/dashboard/result/att1"),timeout=10000)
    check("re-opening a completed test redirects to its result", True)
    check("no second start request for completed test", len([1 for m,p_,_ in mock.log if p_.endswith("/start")])==n_before)
    # ---------- TEST 2: expiry with clock skew ----------
    page.goto(BASE+"/dashboard"); page.wait_for_selector("text=1 of 3"); page.screenshot(path=f"{SHOTS}/dashboard_after1.png",full_page=True)
    page.get_by_role("link",name="Start Test 2").first.click(); page.wait_for_selector("text=Question 1 of 100",timeout=15000)
    s=timer_secs(page); check("short-expiry test countdown comes from server (<=8s)", s<=8, str(s))
    page.keyboard.press("b"); page.wait_for_timeout(300)
    page.wait_for_selector("text=Time's up",timeout=15000); check("countdown hit zero -> Time's up overlay", True)
    page.wait_for_url(re.compile(r"/dashboard/result/att2"),timeout=30000); page.wait_for_selector("text=Time ran out",timeout=10000)
    exp_calls=len([1 for m,p_,_ in mock.log if p_.endswith("/att2/expire")])
    check("expiry retried after 403 until server agreed, then TIME_EXPIRED result", exp_calls>=2, f"expire calls={exp_calls}")
    # ---------- TEST 3: offline retry ----------
    page.goto(BASE+"/dashboard"); page.get_by_role("link",name="Start Test 3").first.click(); page.wait_for_selector("text=Question 1 of 100",timeout=15000)
    mock.fail_answers=True; page.keyboard.press("a"); page.wait_for_selector("text=Offline. Retrying",timeout=8000); check("network failure shows Offline/Retrying badge", True)
    page.screenshot(path=f"{SHOTS}/offline.png")
    page.get_by_role("button",name="Submit",exact=True).click(); page.get_by_role("button",name="Submit test").click()
    page.wait_for_selector("text=reached the server yet",timeout=8000); check("submit warns about unsaved answers instead of silently losing them", True)
    mock.fail_answers=False; page.get_by_role("button",name="Retry and submit").click()
    page.wait_for_url(re.compile(r"/dashboard/result/att3"),timeout=15000)
    check("after recovery the offline answer was delivered and scored", mock.attempts["att3"]["answers"].get("q1",{}).get("selectedOptionId")=="A")
    page.goto(BASE+"/dashboard"); page.wait_for_selector("text=All three tests done",timeout=10000) if page.locator("text=All three tests done").count() else None
    page.wait_for_timeout(800); page.screenshot(path=f"{SHOTS}/dashboard_done.png",full_page=True)
    check("dashboard shows daily completion state", page.locator("text=All done").count()>=1)
    page.goto(BASE+"/dashboard/profile"); page.wait_for_selector("text=Your statistics",timeout=10000); page.screenshot(path=f"{SHOTS}/profile.png",full_page=True)
    # logout clears private data
    page.get_by_role("button",name="Log out").first.click(); page.wait_for_url(re.compile(r"/login"),timeout=10000)
    page.goto(BASE+"/dashboard"); page.wait_for_url(re.compile(r"/login\?next"),timeout=10000); check("after logout dashboard is guarded again", True)
    ctx.close()

    # ---------- MOBILE ----------
    mock2=mock; ctx=b.new_context(viewport={"width":390,"height":844},device_scale_factor=2,is_mobile=True,has_touch=True); install(ctx); page=ctx.new_page(); watch(page)
    for path in ["/","/mpsc-group-c","/mpsc-group-c/syllabus","/mpsc-group-c/exam-pattern","/mpsc-group-c/subjects/polity","/mpsc-group-c/subjects","/about","/login","/signup","/contact"]:
        page.goto(BASE+path); page.wait_for_load_state("networkidle"); o=overflow(page)
        check(f"mobile 390px no horizontal scroll {path}", o<=0, f"overflow={o}")
    page.goto(BASE+"/"); page.screenshot(path=f"{SHOTS}/home_mobile.png"); page.screenshot(path=f"{SHOTS}/home_mobile_full.png",full_page=True)
    page.get_by_role("button",name="Open menu").click(); page.wait_for_selector("#mobile-menu"); page.screenshot(path=f"{SHOTS}/menu_mobile.png")
    check("mobile menu opens with aria-expanded", page.get_by_role("button",name="Close menu").get_attribute("aria-expanded")=="true")
    page.goto(BASE+"/mpsc-group-c/exam-pattern"); page.screenshot(path=f"{SHOTS}/guide_mobile.png")
    # login on mobile, new day state: reset mock progress for a fresh test run
    mock.completed.clear(); mock.attempts.clear(); mock.short_test=99
    page.goto(BASE+"/login"); page.fill("#username","sagar_p"); page.fill("#password","secret1"); page.click("button[type=submit]")
    page.wait_for_selector("text=Welcome back, Sagar",timeout=15000); page.wait_for_selector("text=0 of 3"); page.wait_for_timeout(500)
    check("mobile dashboard no horizontal scroll", overflow(page)<=0, str(overflow(page))); page.screenshot(path=f"{SHOTS}/dashboard_mobile.png",full_page=True)
    page.get_by_role("link",name="Start Test 1").first.click(); page.wait_for_selector("text=Question 1 of 100",timeout=15000)
    check("mobile test screen no horizontal scroll", overflow(page)<=0, str(overflow(page))); page.screenshot(path=f"{SHOTS}/test_mobile.png")
    page.get_by_role("button",name="Open question navigator").click(); page.wait_for_selector("dialog[open]"); page.screenshot(path=f"{SHOTS}/palette_mobile.png")
    page.locator('dialog[open] button[aria-label^="Question 7,"]').click(); page.wait_for_selector("text=Question 7 of 100"); check("mobile palette sheet jumps to question", True)
    page.get_by_role("radio").filter(has_text="Option B").first.tap(); page.wait_for_timeout(400)
    check("touch selection saved", any(b_=={"questionId":"q7","selectedOptionId":"B","status":"ANSWERED"} for m,p_,b_ in mock.log if m=="POST" and p_.endswith("/answers")))
    ctx.close(); b.close()

# The harness deliberately injects 403s (clock-skew expiry) and refused connections
# (offline simulation); the browser logs those as "Failed to load resource". Anything
# else (React/hydration errors, uncaught exceptions) must be absent.
bad=[e for e in console_errors if "Failed to load resource" not in e[1] and "favicon" not in e[1].lower()]
injected=len(console_errors)-len(bad)
check(f"no React/hydration/page errors in the whole run ({injected} injected network-fault logs ignored)", not bad, str(bad[:4]))
print(f"\n{sum(1 for r in results if r[0])}/{len(results)} checks passed")
for ok,n,d in results:
    if not ok: print("FAILED:",n,d)
