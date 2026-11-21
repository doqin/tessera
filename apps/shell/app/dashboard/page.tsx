import { RemoteDashboard } from "../../components/RemoteDashboard";
import { RemotePreload } from "../../components/RemotePreload";

export default function DashboardPage() {
  return (
    <div className="dq-stack" style={{ height: "100%" }}>
      <RemotePreload entryUrl={process.env.NEXT_PUBLIC_DASHBOARD_MODULE_ENTRY ?? ""} />
      <RemoteDashboard />
    </div>
  );
}
