export interface NavigationSubItem {
  path: string;
  label: string;
}

export interface NavigationItem {
  path: string;
  label: string;
  iconName: string;
  hasChevron?: boolean;
  children?: NavigationSubItem[];
}

export const navigationConfig: NavigationItem[] = [
  { path: '/dashboard', label: 'Dashboard', iconName: 'LayoutDashboard' },
  { path: '/inbox', label: 'Inbox', iconName: 'Inbox' },
  {
    path: '/transact',
    label: 'Transact',
    iconName: 'CreditCard',
    hasChevron: true,
    children: [
      { path: '/transact/bill-invoice', label: 'Bill/Invoice' },
      { path: '/transact/cost-allocation', label: 'Cost Allocation' },
      { path: '/transact/goods-and-service', label: 'Goods and Service' },
      { path: '/transact/intern-plan', label: 'Intern Plan' },
      { path: '/transact/item', label: 'Item' },
      { path: '/transact/organization', label: 'Organization' },
      { path: '/transact/purchase-order', label: 'Purchase Order' },
      { path: '/transact/rfq', label: 'RFQ' },
      { path: '/transact/vendor', label: 'Vendor' },
    ],
  },
  { path: '/approvals', label: 'Approvals', iconName: 'FileCheck', hasChevron: true },
  { path: '/integration', label: 'Integration', iconName: 'Network' },
  { path: '/ledger-view', label: 'Ledger View', iconName: 'FileText' },
  { path: '/reports', label: 'Reports', iconName: 'BarChart3', hasChevron: true },
  { path: '/master-reports', label: 'Master Reports', iconName: 'FileSpreadsheet', hasChevron: true },
  { path: '/ap', label: 'AP', iconName: 'ArrowDownLeft', hasChevron: true },
  {
    path: '/ar',
    label: 'AR',
    iconName: 'ArrowUpRight',
    hasChevron: true,
    children: [
      { path: '/ar/inbox', label: 'Inbox' },
      { path: '/ar/open-items', label: 'Open Items' },
    ],
  },
  { path: '/fscp', label: 'FSCP', iconName: 'ShieldCheck', hasChevron: true },
  { path: '/schema', label: 'Schema', iconName: 'Database' },
  { path: '/config', label: 'Config', iconName: 'Settings' },
  { path: '/admin', label: 'Admin (DT)', iconName: 'ShieldAlert' },
];
