// Mock app data for Appily Store
export interface StoreAppData {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  bannerUrl: string;
  downloads: number;
}

export const mockApps: StoreAppData[] = [
  {
    id: '1',
    name: 'FocusFlow',
    description: 'Stay productive with smart focus sessions.',
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/190/190411.png',
    bannerUrl: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80',
    downloads: 12000,
  },
  {
    id: '2',
    name: 'Weatherly',
    description: 'Hyperlocal weather updates and alerts.',
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/1116/1116453.png',
    bannerUrl: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80',
    downloads: 9800,
  },
  {
    id: '3',
    name: 'FitTrack',
    description: 'Track your workouts and progress.',
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/833/833472.png',
    bannerUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    downloads: 15000,
  },
  {
    id: '4',
    name: 'MindfulMe',
    description: 'Guided meditations and mindfulness.',
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/4320/4320337.png',
    bannerUrl: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80',
    downloads: 8000,
  },
  {
    id: '5',
    name: 'Recipe Genie',
    description: 'Discover and save delicious recipes.',
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/135/135620.png',
    bannerUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
    downloads: 17000,
  },
];
