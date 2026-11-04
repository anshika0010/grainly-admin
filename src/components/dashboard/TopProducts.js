"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const initials = (name) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

export default function TopProducts({ products }) {
  return (
    <Card className="border-border/60">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base font-semibold">Top Selling Products</CardTitle>
        <a href="/admin/ecommerce/products" className="text-xs font-medium text-primary hover:underline">
          View All
        </a>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="w-full">
          <Table className="min-w-[620px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6">Item</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Sold</TableHead>
                <TableHead className="pr-6">Stock</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {products.map((p) => {
                const product = p.product;


                const variant = product?.variants?.[0];


                const totalStock =
                  product?.variants?.reduce(
                    (total, v) => total + Number(v.stockQuantity || 0),
                    0
                  ) || 0;

                return (
                  <TableRow key={product.id} className="group">
                    {/* Product */}
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 shrink-0 rounded-lg border border-border/60">
                          <AvatarImage
                            src={product.featuredimg}
                            alt={product.name}
                            className="rounded-lg object-cover"
                          />

                          <AvatarFallback className="rounded-lg bg-primary/10 text-[11px] font-semibold text-primary">
                            {initials(product.name)}
                          </AvatarFallback>
                        </Avatar>

                        <div>
                          <p className="text-sm font-medium leading-tight text-foreground">
                            {product.name}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {product.category?.name || "Uncategorized"}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Price */}
                    <TableCell className="text-sm">
                      {variant ? (
                        <>
                          {variant.discountedPrice ? (
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">
                                ₹{Number(variant.discountedPrice).toLocaleString("en-IN")}
                              </span>

                              <span className="text-xs text-muted-foreground line-through">
                                ₹{Number(variant.price).toLocaleString("en-IN")}
                              </span>
                            </div>
                          ) : (
                            <span className="font-medium text-foreground">
                              ₹{Number(variant.price).toLocaleString("en-IN")}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>

                    {/* Sold */}
                    <TableCell className="text-sm text-muted-foreground">
                      {p.totalSold ?? 0}
                    </TableCell>

                    {/* Stock */}
                    <TableCell className="pr-6">
                      <Badge
                        variant="secondary"
                        className={
                          totalStock > 0
                            ? "bg-emerald-500/15 text-xs font-medium text-emerald-600 dark:text-emerald-400"
                            : "bg-red-500/15 text-xs font-medium text-red-600 dark:text-red-400"
                        }
                      >
                        {totalStock}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}