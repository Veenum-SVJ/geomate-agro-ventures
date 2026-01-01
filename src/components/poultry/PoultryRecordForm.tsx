import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PoultryRecord } from './PoultrySpreadsheet';

interface PoultryRecordFormProps {
  record?: PoultryRecord | null;
  onSubmit: (data: Partial<PoultryRecord>) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function PoultryRecordForm({ 
  record, 
  onSubmit, 
  onCancel,
  isSubmitting 
}: PoultryRecordFormProps) {
  const [formData, setFormData] = useState<Partial<PoultryRecord>>({
    record_date: record?.record_date || new Date().toISOString().split('T')[0],
    pen: record?.pen || '',
    line: record?.line || '',
    // Production
    eggs_big: record?.eggs_big ?? record?.egg_count ?? 0,
    eggs_pullet: record?.eggs_pullet ?? 0,
    eggs_jumbo: record?.eggs_jumbo ?? 0,
    eggs_cracked: record?.eggs_cracked ?? 0,
    // Supply
    supply_big: record?.supply_big ?? 0,
    supply_pullet: record?.supply_pullet ?? 0,
    supply_jumbo: record?.supply_jumbo ?? 0,
    supply_cracked: record?.supply_cracked ?? 0,
    // Customer
    customer_name: record?.customer_name ?? '',
    customer_phone: record?.customer_phone ?? '',
    invoice_ref: record?.invoice_ref ?? '',
    // Health
    mortality: record?.mortality ?? 0,
    mortality_cause: record?.mortality_cause ?? '',
    notes: record?.notes ?? record?.health_notes ?? '',
  });

  const handleChange = (field: keyof PoultryRecord, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Calculate totals
  const totalProduction = (Number(formData.eggs_big) || 0) + 
    (Number(formData.eggs_pullet) || 0) + 
    (Number(formData.eggs_jumbo) || 0);
  
  const totalCracked = Number(formData.eggs_cracked) || 0;
  
  const totalSupply = (Number(formData.supply_big) || 0) + 
    (Number(formData.supply_pullet) || 0) + 
    (Number(formData.supply_jumbo) || 0) + 
    (Number(formData.supply_cracked) || 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="record_date">Date</Label>
          <Input
            id="record_date"
            type="date"
            value={formData.record_date}
            onChange={(e) => handleChange('record_date', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="pen">Pen</Label>
          <Input
            id="pen"
            value={formData.pen}
            onChange={(e) => handleChange('pen', e.target.value)}
            placeholder="e.g., A1"
          />
        </div>
        <div>
          <Label htmlFor="line">Line</Label>
          <Input
            id="line"
            value={formData.line}
            onChange={(e) => handleChange('line', e.target.value)}
            placeholder="e.g., 1"
          />
        </div>
      </div>

      <Tabs defaultValue="production" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="production">Production</TabsTrigger>
          <TabsTrigger value="supply">Supply</TabsTrigger>
          <TabsTrigger value="customer">Customer</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
        </TabsList>

        <TabsContent value="production" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-green-700">Egg Production by Size</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="eggs_big">Big Eggs</Label>
                  <Input
                    id="eggs_big"
                    type="number"
                    min="0"
                    value={formData.eggs_big}
                    onChange={(e) => handleChange('eggs_big', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="eggs_pullet">Pullet Eggs</Label>
                  <Input
                    id="eggs_pullet"
                    type="number"
                    min="0"
                    value={formData.eggs_pullet}
                    onChange={(e) => handleChange('eggs_pullet', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="eggs_jumbo">Jumbo Eggs</Label>
                  <Input
                    id="eggs_jumbo"
                    type="number"
                    min="0"
                    value={formData.eggs_jumbo}
                    onChange={(e) => handleChange('eggs_jumbo', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="eggs_cracked">Cracked Eggs</Label>
                  <Input
                    id="eggs_cracked"
                    type="number"
                    min="0"
                    value={formData.eggs_cracked}
                    onChange={(e) => handleChange('eggs_cracked', Number(e.target.value))}
                  />
                </div>
              </div>
              
              <div className="flex gap-4 pt-2 border-t">
                <div className="flex-1 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                  <div className="text-xs text-muted-foreground">Total Good Eggs</div>
                  <div className="text-xl font-bold text-green-700">{totalProduction}</div>
                </div>
                <div className="flex-1 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                  <div className="text-xs text-muted-foreground">Cracked</div>
                  <div className="text-xl font-bold text-amber-700">{totalCracked}</div>
                </div>
                <div className="flex-1 p-3 bg-muted rounded-lg">
                  <div className="text-xs text-muted-foreground">Grand Total</div>
                  <div className="text-xl font-bold">{totalProduction + totalCracked}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="supply" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-blue-700">Eggs Supplied/Sold</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="supply_big">Big Eggs</Label>
                  <Input
                    id="supply_big"
                    type="number"
                    min="0"
                    value={formData.supply_big}
                    onChange={(e) => handleChange('supply_big', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="supply_pullet">Pullet Eggs</Label>
                  <Input
                    id="supply_pullet"
                    type="number"
                    min="0"
                    value={formData.supply_pullet}
                    onChange={(e) => handleChange('supply_pullet', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="supply_jumbo">Jumbo Eggs</Label>
                  <Input
                    id="supply_jumbo"
                    type="number"
                    min="0"
                    value={formData.supply_jumbo}
                    onChange={(e) => handleChange('supply_jumbo', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="supply_cracked">Cracked Eggs</Label>
                  <Input
                    id="supply_cracked"
                    type="number"
                    min="0"
                    value={formData.supply_cracked}
                    onChange={(e) => handleChange('supply_cracked', Number(e.target.value))}
                  />
                </div>
              </div>
              
              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border-t">
                <div className="text-xs text-muted-foreground">Total Supplied</div>
                <div className="text-xl font-bold text-blue-700">{totalSupply}</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customer" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-purple-700">Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="customer_name">Customer Name</Label>
                <Input
                  id="customer_name"
                  value={formData.customer_name}
                  onChange={(e) => handleChange('customer_name', e.target.value)}
                  placeholder="Enter customer name"
                />
              </div>
              <div>
                <Label htmlFor="customer_phone">Contact Number</Label>
                <Input
                  id="customer_phone"
                  value={formData.customer_phone}
                  onChange={(e) => handleChange('customer_phone', e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <Label htmlFor="invoice_ref">Invoice/Reference #</Label>
                <Input
                  id="invoice_ref"
                  value={formData.invoice_ref}
                  onChange={(e) => handleChange('invoice_ref', e.target.value)}
                  placeholder="Enter invoice or reference number"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-red-700">Health & Mortality</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mortality">Mortality Count</Label>
                  <Input
                    id="mortality"
                    type="number"
                    min="0"
                    value={formData.mortality}
                    onChange={(e) => handleChange('mortality', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="mortality_cause">Cause</Label>
                  <Input
                    id="mortality_cause"
                    value={formData.mortality_cause}
                    onChange={(e) => handleChange('mortality_cause', e.target.value)}
                    placeholder="e.g., Disease, Heat"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Any additional observations..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : record ? 'Update Record' : 'Add Record'}
        </Button>
      </div>
    </form>
  );
}
