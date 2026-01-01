import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { FileText, Download, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { NairaIcon } from '@/components/icons/NairaIcon';
import { supabase } from '@/integrations/supabase/client';
import { useFarmId } from '@/hooks/useFarmId';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

const Reports = () => {
  const { data: farmId, isLoading: farmLoading } = useFarmId();
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState('last_month');
  
  const getDateRange = () => {
    const now = new Date();
    switch (dateRange) {
      case 'this_month':
        return { start: startOfMonth(now), end: now };
      case 'last_month':
        return { start: startOfMonth(subMonths(now, 1)), end: endOfMonth(subMonths(now, 1)) };
      case 'last_3_months':
        return { start: startOfMonth(subMonths(now, 3)), end: now };
      case 'last_6_months':
        return { start: startOfMonth(subMonths(now, 6)), end: now };
      default:
        return { start: startOfMonth(subMonths(now, 1)), end: endOfMonth(subMonths(now, 1)) };
    }
  };

  const { start, end } = getDateRange();
  const startDate = format(start, 'yyyy-MM-dd');
  const endDate = format(end, 'yyyy-MM-dd');

  // Fetch poultry sales
  const { data: poultrySales, isLoading: poultryLoading } = useQuery({
    queryKey: ['poultry-sales-report', farmId, startDate, endDate],
    queryFn: async () => {
      if (!farmId) return [];
      const { data, error } = await supabase
        .from('poultry_sales')
        .select('*')
        .eq('farm_id', farmId)
        .gte('sale_date', startDate)
        .lte('sale_date', endDate);
      if (error) throw error;
      return data || [];
    },
    enabled: !!farmId,
  });

  // Fetch poultry resources (costs)
  const { data: poultryResources, isLoading: resourcesLoading } = useQuery({
    queryKey: ['poultry-resources-report', farmId, startDate, endDate],
    queryFn: async () => {
      if (!farmId) return [];
      const { data, error } = await supabase
        .from('poultry_resources')
        .select('*')
        .eq('farm_id', farmId)
        .gte('record_date', startDate)
        .lte('record_date', endDate);
      if (error) throw error;
      return data || [];
    },
    enabled: !!farmId,
  });

  // Fetch fishery sales
  const { data: fisherySales, isLoading: fisheryLoading } = useQuery({
    queryKey: ['fishery-sales-report', farmId, startDate, endDate],
    queryFn: async () => {
      if (!farmId) return [];
      const { data, error } = await supabase
        .from('fishery_sales')
        .select('*')
        .eq('farm_id', farmId)
        .gte('sale_date', startDate)
        .lte('sale_date', endDate);
      if (error) throw error;
      return data || [];
    },
    enabled: !!farmId,
  });

  // Fetch fishery production (costs)
  const { data: fisheryProduction, isLoading: fisheryProdLoading } = useQuery({
    queryKey: ['fishery-production-report', farmId, startDate, endDate],
    queryFn: async () => {
      if (!farmId) return [];
      const { data, error } = await supabase
        .from('fishery_production')
        .select('*')
        .eq('farm_id', farmId)
        .gte('record_date', startDate)
        .lte('record_date', endDate);
      if (error) throw error;
      return data || [];
    },
    enabled: !!farmId,
  });

  // Fetch crop sales
  const { data: cropSales, isLoading: cropSalesLoading } = useQuery({
    queryKey: ['crop-sales-report', farmId, startDate, endDate],
    queryFn: async () => {
      if (!farmId) return [];
      const { data, error } = await supabase
        .from('crop_sales')
        .select('*')
        .eq('farm_id', farmId)
        .gte('sale_date', startDate)
        .lte('sale_date', endDate);
      if (error) throw error;
      return data || [];
    },
    enabled: !!farmId,
  });

  // Fetch crop production (costs)
  const { data: cropProduction, isLoading: cropProdLoading } = useQuery({
    queryKey: ['crop-production-report', farmId, startDate, endDate],
    queryFn: async () => {
      if (!farmId) return [];
      const { data, error } = await supabase
        .from('crop_production')
        .select('*')
        .eq('farm_id', farmId)
        .gte('record_date', startDate)
        .lte('record_date', endDate);
      if (error) throw error;
      return data || [];
    },
    enabled: !!farmId,
  });

  // Fetch feedmill costs
  const { data: feedmillIngredients, isLoading: feedmillLoading } = useQuery({
    queryKey: ['feedmill-ingredients-report', farmId, startDate, endDate],
    queryFn: async () => {
      if (!farmId) return [];
      const { data, error } = await supabase
        .from('feedmill_ingredients')
        .select('*')
        .eq('farm_id', farmId)
        .gte('record_date', startDate)
        .lte('record_date', endDate);
      if (error) throw error;
      return data || [];
    },
    enabled: !!farmId,
  });

  const { data: feedmillPower, isLoading: powerLoading } = useQuery({
    queryKey: ['feedmill-power-report', farmId, startDate, endDate],
    queryFn: async () => {
      if (!farmId) return [];
      const { data, error } = await supabase
        .from('feedmill_power')
        .select('*')
        .eq('farm_id', farmId)
        .gte('record_date', startDate)
        .lte('record_date', endDate);
      if (error) throw error;
      return data || [];
    },
    enabled: !!farmId,
  });

  // Calculate totals
  const poultryRevenue = poultrySales?.reduce((sum, sale) => {
    const eggRevenue = (sale.eggs_sold || 0) * (sale.egg_price_per_crate || 0);
    const birdRevenue = (sale.birds_sold || 0) * (sale.bird_price_each || 0);
    return sum + eggRevenue + birdRevenue;
  }, 0) || 0;

  const poultryCosts = poultryResources?.reduce((sum, r) => {
    return sum + (r.feed_cost || 0) + (r.medication_cost || 0);
  }, 0) || 0;

  const fisheryRevenue = fisherySales?.reduce((sum, sale) => {
    return sum + (sale.quantity_kg || 0) * (sale.price_per_kg || 0);
  }, 0) || 0;

  const fisheryCosts = fisheryProduction?.reduce((sum, p) => {
    return sum + (p.feed_cost || 0);
  }, 0) || 0;

  const cropRevenue = cropSales?.reduce((sum, sale) => {
    return sum + (sale.quantity_kg || 0) * (sale.price_per_kg || 0);
  }, 0) || 0;

  const cropCosts = cropProduction?.reduce((sum, p) => {
    return sum + (p.cost || 0);
  }, 0) || 0;

  const feedmillCosts = (feedmillIngredients?.reduce((sum, i) => {
    return sum + (i.quantity_kg || 0) * (i.cost_per_kg || 0);
  }, 0) || 0) + (feedmillPower?.reduce((sum, p) => sum + (p.cost || 0), 0) || 0);

  const totalRevenue = poultryRevenue + fisheryRevenue + cropRevenue;
  const totalCosts = poultryCosts + fisheryCosts + cropCosts + feedmillCosts;
  const netProfit = totalRevenue - totalCosts;

  const isLoading = farmLoading || poultryLoading || resourcesLoading || fisheryLoading || 
                    fisheryProdLoading || cropSalesLoading || cropProdLoading || feedmillLoading || powerLoading;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
      toast({ title: 'No data to export', variant: 'destructive' });
      return;
    }
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(','));
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${startDate}_to_${endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Report exported successfully' });
  };

  const exportProfitLoss = () => {
    const data = [
      { category: 'Poultry Revenue', amount: poultryRevenue },
      { category: 'Poultry Costs', amount: -poultryCosts },
      { category: 'Fishery Revenue', amount: fisheryRevenue },
      { category: 'Fishery Costs', amount: -fisheryCosts },
      { category: 'Crop Revenue', amount: cropRevenue },
      { category: 'Crop Costs', amount: -cropCosts },
      { category: 'Feedmill Costs', amount: -feedmillCosts },
      { category: 'Total Revenue', amount: totalRevenue },
      { category: 'Total Costs', amount: totalCosts },
      { category: 'Net Profit', amount: netProfit },
    ];
    exportToCSV(data, 'profit_loss_report');
  };

  const moduleSummary = [
    { module: 'Poultry', revenue: poultryRevenue, costs: poultryCosts, profit: poultryRevenue - poultryCosts },
    { module: 'Fishery', revenue: fisheryRevenue, costs: fisheryCosts, profit: fisheryRevenue - fisheryCosts },
    { module: 'Crops', revenue: cropRevenue, costs: cropCosts, profit: cropRevenue - cropCosts },
    { module: 'Feedmill', revenue: 0, costs: feedmillCosts, profit: -feedmillCosts },
  ];

  if (farmLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Reports
          </h1>
          <p className="text-muted-foreground">
            Financial summaries and performance reports
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="last_month">Last Month</SelectItem>
              <SelectItem value="last_3_months">Last 3 Months</SelectItem>
              <SelectItem value="last_6_months">Last 6 Months</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportProfitLoss} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export P&L
          </Button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-500" />
              Total Costs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalCosts)}</p>
            )}
          </CardContent>
        </Card>

        <Card className={`border-l-4 ${netProfit >= 0 ? 'border-l-primary' : 'border-l-orange-500'}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <NairaIcon className="h-4 w-4" />
              Net Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-primary' : 'text-orange-600'}`}>
                {formatCurrency(netProfit)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList>
          <TabsTrigger value="summary">Module Summary</TabsTrigger>
          <TabsTrigger value="poultry">Poultry</TabsTrigger>
          <TabsTrigger value="fishery">Fishery</TabsTrigger>
          <TabsTrigger value="crops">Crops</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <Card>
            <CardHeader>
              <CardTitle>Performance by Module</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Module</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Costs</TableHead>
                    <TableHead className="text-right">Profit/Loss</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : (
                    moduleSummary.map((row) => (
                      <TableRow key={row.module}>
                        <TableCell className="font-medium">{row.module}</TableCell>
                        <TableCell className="text-right text-green-600">{formatCurrency(row.revenue)}</TableCell>
                        <TableCell className="text-right text-red-600">{formatCurrency(row.costs)}</TableCell>
                        <TableCell className={`text-right font-medium ${row.profit >= 0 ? 'text-primary' : 'text-orange-600'}`}>
                          {formatCurrency(row.profit)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                  <TableRow className="border-t-2">
                    <TableCell className="font-bold">Total</TableCell>
                    <TableCell className="text-right font-bold text-green-600">{formatCurrency(totalRevenue)}</TableCell>
                    <TableCell className="text-right font-bold text-red-600">{formatCurrency(totalCosts)}</TableCell>
                    <TableCell className={`text-right font-bold ${netProfit >= 0 ? 'text-primary' : 'text-orange-600'}`}>
                      {formatCurrency(netProfit)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="poultry">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Poultry Sales</CardTitle>
              <Button variant="outline" size="sm" onClick={() => exportToCSV(poultrySales || [], 'poultry_sales')}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Eggs Sold</TableHead>
                    <TableHead className="text-right">Birds Sold</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 5 }).map((_, j) => (
                          <TableCell key={j}><Skeleton className="h-4 w-16" /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : poultrySales && poultrySales.length > 0 ? (
                    poultrySales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell>{format(new Date(sale.sale_date), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>{sale.customer_name || '-'}</TableCell>
                        <TableCell className="text-right">{sale.eggs_sold}</TableCell>
                        <TableCell className="text-right">{sale.birds_sold}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency((sale.eggs_sold * sale.egg_price_per_crate) + (sale.birds_sold * sale.bird_price_each))}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No sales data for this period
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fishery">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Fishery Sales</CardTitle>
              <Button variant="outline" size="sm" onClick={() => exportToCSV(fisherySales || [], 'fishery_sales')}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Species</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Qty (kg)</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 5 }).map((_, j) => (
                          <TableCell key={j}><Skeleton className="h-4 w-16" /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : fisherySales && fisherySales.length > 0 ? (
                    fisherySales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell>{format(new Date(sale.sale_date), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>{sale.fish_species}</TableCell>
                        <TableCell>{sale.customer_name || '-'}</TableCell>
                        <TableCell className="text-right">{sale.quantity_kg}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(sale.quantity_kg * sale.price_per_kg)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No sales data for this period
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="crops">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Crop Sales</CardTitle>
              <Button variant="outline" size="sm" onClick={() => exportToCSV(cropSales || [], 'crop_sales')}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Crop</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Qty (kg)</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 5 }).map((_, j) => (
                          <TableCell key={j}><Skeleton className="h-4 w-16" /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : cropSales && cropSales.length > 0 ? (
                    cropSales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell>{format(new Date(sale.sale_date), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>{sale.crop_name}</TableCell>
                        <TableCell>{sale.customer_name || '-'}</TableCell>
                        <TableCell className="text-right">{sale.quantity_kg}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(sale.quantity_kg * sale.price_per_kg)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No sales data for this period
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
