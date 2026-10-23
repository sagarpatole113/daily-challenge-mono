import { GuideRoute, guideMetadata } from "@/components/marketing/guide-route";

const PATH = "/mpsc-group-c/exam-pattern";
export const metadata = guideMetadata(PATH);

export default function Page() {
  return <GuideRoute path={PATH} />;
}
