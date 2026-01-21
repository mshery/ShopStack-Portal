import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { formatDate } from "../../utils/format";
import { useTenantCurrency } from "@/modules/tenant";
import type { Sale } from "@/shared/types/models";

interface RecentOrdersProps {
  orders: Sale[];
}

export default function RecentOrders({ orders }: RecentOrdersProps) {
  const { formatPrice } = useTenantCurrency();
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Recent Orders
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
            See all
          </button>
        </div>
      </div>
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
              >
                Order #
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
              >
                Customer
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
              >
                Total
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
              >
                Date
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
              >
                Status
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {orders.map((order) => (
              <TableRow key={order.id} className="">
                <TableCell className="py-3 text-sm font-medium text-gray-800 dark:text-white/90">
                  {order.number}
                </TableCell>
                <TableCell className="py-3 text-sm text-gray-500 dark:text-gray-400">
                  Customer #{order.customerId.split("-").pop()}
                </TableCell>
                <TableCell className="py-3 text-sm font-bold text-gray-800 dark:text-white/90">
                  {formatPrice(order.grandTotal)}
                </TableCell>
                <TableCell className="py-3 text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(order.createdAt)}
                </TableCell>
                <TableCell className="py-3">
                  <Badge color="success" size="sm">
                    Completed
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {orders.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-10 text-center text-gray-500"
                >
                  No orders found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
