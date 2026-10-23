import { GuideRoute, guideMetadata } from "@/components/marketing/guide-route";

const PATH = "/mpsc-group-c/daily-mock-test";
export const metadata = guideMetadata(PATH);

export default function Page() {
  return <GuideRoute path={PATH} />;
}
