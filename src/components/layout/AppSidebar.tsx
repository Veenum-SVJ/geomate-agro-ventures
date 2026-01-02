import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  Egg,
  Fish,
  Wheat,
  Factory,
  Package,
  ClipboardList,
  Users,
  UserCircle,
  LogOut,
  ChevronUp,
  FileText,
  Globe,
  Image,
  MessageSquare,
  Home,
  Settings,
  LucideIcon,
} from 'lucide-react';

interface MenuItem {
  title: string;
  icon: LucideIcon;
  path: string;
  requiredRoles?: ('admin' | 'manager' | 'worker')[];
}

interface MenuGroup {
  group: string;
  items: MenuItem[];
  requiredRoles?: ('admin' | 'manager' | 'worker')[];
}

// Define menu items with role requirements
const menuItems: MenuGroup[] = [
  {
    group: 'Website CMS',
    requiredRoles: ['admin'], // Only admins can access CMS
    items: [
      { title: 'CMS Dashboard', icon: Globe, path: '/admin/cms' },
      { title: 'Products', icon: Package, path: '/admin/cms/products' },
      { title: 'Gallery', icon: Image, path: '/admin/cms/gallery' },
      { title: 'Pages', icon: FileText, path: '/admin/cms/pages' },
      { title: 'Inquiries', icon: MessageSquare, path: '/admin/cms/inquiries' },
    ],
  },
  {
    group: 'Farm Management',
    items: [
      { title: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    ],
  },
  {
    group: 'Farm Operations',
    items: [
      { title: 'Poultry', icon: Egg, path: '/admin/poultry' },
      { title: 'Fishery', icon: Fish, path: '/admin/fishery' },
      { title: 'Crops', icon: Wheat, path: '/admin/crops' },
      { title: 'Feedmill', icon: Factory, path: '/admin/feedmill' },
    ],
  },
  {
    group: 'Management',
    items: [
      { title: 'Inventory', icon: Package, path: '/admin/inventory' },
      { title: 'Tasks', icon: ClipboardList, path: '/admin/tasks' },
      { title: 'Workers', icon: Users, path: '/admin/workers', requiredRoles: ['admin'] },
      { title: 'Customers', icon: UserCircle, path: '/admin/customers', requiredRoles: ['admin', 'manager'] },
      { title: 'Reports', icon: FileText, path: '/admin/reports', requiredRoles: ['admin', 'manager'] },
    ],
  },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { role, isAdmin, isLoading: roleLoading } = useUserRole();

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('user_id', user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin');
  };

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Filter menu items based on user role
  const filterMenuItems = (items: MenuItem[]): MenuItem[] => {
    if (!role) return [];
    return items.filter((item) => {
      if (!item.requiredRoles) return true; // No role requirement = visible to all
      return item.requiredRoles.includes(role);
    });
  };

  // Filter menu groups based on user role
  const filteredMenuGroups = menuItems
    .map((group) => {
      // Check if the whole group has role requirements
      if (group.requiredRoles && role && !group.requiredRoles.includes(role)) {
        return null;
      }
      
      const filteredItems = filterMenuItems(group.items);
      if (filteredItems.length === 0) return null;
      
      return {
        ...group,
        items: filteredItems,
      };
    })
    .filter(Boolean) as MenuGroup[];

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'default';
      case 'manager':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">G</span>
          </div>
          <div>
            <span className="font-bold text-foreground">Geomate</span>
            <span className="text-primary font-bold"> Agro</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        {roleLoading ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            Loading menu...
          </div>
        ) : (
          filteredMenuGroups.map((group) => (
            <SidebarGroup key={group.group}>
              <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {group.group}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton
                        isActive={location.pathname === item.path}
                        onClick={() => navigate(item.path)}
                        className="transition-colors"
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))
        )}
      </SidebarContent>

      <SidebarFooter className="p-2">
        {/* Settings - Admin only */}
        {isAdmin && (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={location.pathname === '/admin/settings'}
                onClick={() => navigate('/admin/settings')}
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}

        <SidebarSeparator className="my-2" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-lg p-2 hover:bg-sidebar-accent transition-colors">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar_url || user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {getInitials(profile?.full_name || user?.email)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-1 flex-col items-start text-sm">
                <span className="font-medium text-sidebar-foreground truncate max-w-[140px]">
                  {profile?.full_name || 'User'}
                </span>
                <div className="flex items-center gap-2">
                  {role && (
                    <Badge variant={getRoleBadgeVariant(role)} className="text-[10px] px-1.5 py-0 capitalize">
                      {role}
                    </Badge>
                  )}
                </div>
              </div>
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => navigate('/')}>
              <Home className="mr-2 h-4 w-4" />
              Go back to homepage
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
