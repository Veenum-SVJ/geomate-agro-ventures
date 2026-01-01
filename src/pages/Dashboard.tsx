import { Egg, Fish, Wheat, Factory, Users, ClipboardList, Package } from 'lucide-react';
import { NairaIcon } from '@/components/icons/NairaIcon';
import { KPICard } from '@/components/dashboard/KPICard';
import { ProfitChart } from '@/components/dashboard/ProfitChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your farm operations.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Poultry"
          value="2,450"
          subtitle="Active birds"
          icon={Egg}
          variant="primary"
          trend={{ value: 12, isPositive: true }}
        />
        <KPICard
          title="Fish Stock"
          value="8,200"
          subtitle="Across 4 ponds"
          icon={Fish}
          variant="accent"
          trend={{ value: 8, isPositive: true }}
        />
        <KPICard
          title="Crop Yield"
          value="15.2 tons"
          subtitle="This season"
          icon={Wheat}
          variant="success"
          trend={{ value: 5, isPositive: true }}
        />
        <KPICard
          title="Feed Produced"
          value="48 bags"
          subtitle="This month"
          icon={Factory}
          variant="warning"
          trend={{ value: -3, isPositive: false }}
        />
      </div>

      {/* Profit Chart */}
      <ProfitChart />

      {/* Secondary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Profit"
          value="₦1.41M"
          subtitle="Last 6 months"
          icon={NairaIcon}
          trend={{ value: 23, isPositive: true }}
        />
        <KPICard
          title="Active Workers"
          value="12"
          subtitle="Across all sections"
          icon={Users}
        />
        <KPICard
          title="Pending Tasks"
          value="8"
          subtitle="Due this week"
          icon={ClipboardList}
        />
        <KPICard
          title="Low Stock Items"
          value="5"
          subtitle="Need reorder"
          icon={Package}
        />
      </div>

      {/* Recent Activity */}
      <Card className="animate-slide-up">
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { action: 'Egg collection logged', section: 'Poultry', time: '2 hours ago', value: '245 eggs' },
              { action: 'Feed distributed', section: 'Fishery', time: '4 hours ago', value: '50kg' },
              { action: 'Harvest recorded', section: 'Crops', time: 'Yesterday', value: '200kg tomatoes' },
              { action: 'New worker added', section: 'Management', time: 'Yesterday', value: 'Amina Bello' },
              { action: 'Feed production completed', section: 'Feedmill', time: '2 days ago', value: '12 bags' },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <div>
                  <p className="font-medium text-foreground">{item.action}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.section} • {item.time}
                  </p>
                </div>
                <span className="text-sm font-medium text-primary">{item.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
