

import { PageHeader } from "@/components/admin/page-header";
import { HistoryTable } from "./history-table";
import { getChangeHistory } from "@/lib/server/api";

export const runtime = 'nodejs';

export default async function HistoryPage() {
  const history = await getChangeHistory();

  return (
    <div className="container mx-auto py-2">
      <PageHeader
        title="Change History"
        description="View a log of recent changes made in the admin panel."
      />
      <HistoryTable data={history} />
    </div>
  );
}
