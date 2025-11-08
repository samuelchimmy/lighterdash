import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/lighter-api";
import { ArrowUpRight, ArrowDownRight, History } from "lucide-react";

interface Transaction {
  hash: string;
  type: number;
  info: string;
  status: number;
  timestamp: number;
  executed_at: number;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
}

const TX_TYPES: Record<number, string> = {
  8: "Change PubKey",
  9: "Create SubAccount",
  10: "Create Pool",
  11: "Update Pool",
  12: "Transfer",
  13: "Withdraw",
  14: "Create Order",
  15: "Cancel Order",
  16: "Cancel All",
  17: "Modify Order",
  18: "Mint Shares",
  19: "Burn Shares",
  20: "Update Leverage",
};

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No transactions found</p>
        </CardContent>
      </Card>
    );
  }

  const recentTransactions = transactions.slice(0, 20);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Transaction History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Hash</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentTransactions.map((tx, index) => {
              const typeName = TX_TYPES[tx.type] || `Type ${tx.type}`;
              const isWithdraw = tx.type === 13;
              const isDeposit = tx.type === 12;
              
              return (
                <TableRow key={tx.hash || index}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {isWithdraw && <ArrowUpRight className="h-4 w-4 text-red-500" />}
                      {isDeposit && <ArrowDownRight className="h-4 w-4 text-green-500" />}
                      <span className="font-medium">{typeName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(tx.executed_at || tx.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={tx.status === 2 ? 'default' : tx.status === 0 ? 'destructive' : 'secondary'}>
                      {tx.status === 2 ? 'Executed' : tx.status === 1 ? 'Pending' : 'Failed'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">
                    {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
