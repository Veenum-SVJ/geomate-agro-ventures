import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, ExternalLink, RefreshCw, Smartphone, Monitor, Tablet } from 'lucide-react';

interface PreviewPage {
  label: string;
  path: string;
}

interface PreviewDrawerProps {
  pages: PreviewPage[];
  defaultPage?: string;
  triggerLabel?: string;
}

type DeviceSize = 'mobile' | 'tablet' | 'desktop';

const deviceSizes: Record<DeviceSize, { width: string; icon: React.ReactNode; label: string }> = {
  mobile: { width: '375px', icon: <Smartphone className="h-4 w-4" />, label: 'Mobile' },
  tablet: { width: '768px', icon: <Tablet className="h-4 w-4" />, label: 'Tablet' },
  desktop: { width: '100%', icon: <Monitor className="h-4 w-4" />, label: 'Desktop' },
};

export function PreviewDrawer({ pages, defaultPage, triggerLabel = 'Preview' }: PreviewDrawerProps) {
  const [selectedPage, setSelectedPage] = useState(defaultPage || pages[0]?.path || '/');
  const [device, setDevice] = useState<DeviceSize>('desktop');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleOpenExternal = () => {
    window.open(selectedPage, '_blank');
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">
          <Eye className="mr-2 h-4 w-4" />
          {triggerLabel}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-4xl p-0 flex flex-col">
        <SheetHeader className="p-4 border-b space-y-0">
          <div className="flex items-center justify-between gap-4">
            <SheetTitle className="text-lg">Preview</SheetTitle>
            <div className="flex items-center gap-2">
              {pages.length > 1 && (
                <Select value={selectedPage} onValueChange={setSelectedPage}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pages.map((page) => (
                      <SelectItem key={page.path} value={page.path}>
                        {page.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <div className="flex border rounded-md">
                {(Object.keys(deviceSizes) as DeviceSize[]).map((size) => (
                  <Button
                    key={size}
                    variant={device === size ? 'secondary' : 'ghost'}
                    size="sm"
                    className="rounded-none first:rounded-l-md last:rounded-r-md"
                    onClick={() => setDevice(size)}
                    title={deviceSizes[size].label}
                  >
                    {deviceSizes[size].icon}
                  </Button>
                ))}
              </div>
              <Button variant="ghost" size="icon" onClick={handleRefresh} title="Refresh preview">
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleOpenExternal} title="Open in new tab">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SheetHeader>
        <div className="flex-1 bg-muted p-4 overflow-auto flex justify-center">
          <div
            className="bg-background rounded-lg shadow-lg overflow-hidden transition-all duration-300"
            style={{ width: deviceSizes[device].width, height: '100%' }}
          >
            <iframe
              key={refreshKey}
              src={selectedPage}
              className="w-full h-full border-0"
              title="Page Preview"
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
