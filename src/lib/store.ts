import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'passenger' | 'driver' | 'both';
  avatar?: string;
  location?: {
    lat: number;
    lng: number;
  };
  phone?: string;
  verified: boolean;
}

export interface Moto {
  id: string;
  driverId: string;
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  photo?: string;
  capacity: number;
}

export interface Route {
  id: string;
  driverId: string;
  driver: User;
  departure: {
    name: string;
    lat: number;
    lng: number;
  };
  arrival: {
    name: string;
    lat: number;
    lng: number;
  };
  departureTime: string;
  arrivalTime: string;
  daysOfWeek: number[];
  availableSeats: number;
  moto: Moto;
  createdAt: string;
}

export interface RideRequest {
  id: string;
  passengerId: string;
  routeId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  requestedSeats: number;
  createdAt: string;
  respondedAt?: string;
}

interface AuthStore {
  user: User | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

interface MotosStore {
  motos: Moto[];
  addMoto: (moto: Moto) => void;
  removeMoto: (id: string) => void;
  updateMoto: (id: string, data: Partial<Moto>) => void;
  getMotosByDriver: (driverId: string) => Moto[];
}

interface RoutesStore {
  routes: Route[];
  addRoute: (route: Route) => void;
  createRoute: (data: {
    departure: string;
    arrival: string;
    day: string;
    time: string;
    availableSeats: number;
    price: number;
    description: string;
    driverId: string;
  }) => void;
  getRoutes: (filters?: any) => Route[];
  updateRoute: (id: string, route: Partial<Route>) => void;
  deleteRoute: (id: string) => void;
  getRoutesByDriver: (driverId: string) => Route[];
}

interface RideRequestsStore {
  requests: RideRequest[];
  addRequest: (request: RideRequest) => void;
  updateRequestStatus: (id: string, status: RideRequest['status']) => void;
  getRequestsByPassenger: (passengerId: string) => RideRequest[];
  getRequestsByDriver: (driverId: string) => RideRequest[];
}

type LocationStatus = 'idle' | 'prompting' | 'granted' | 'denied' | 'error';

interface LocationStore {
  location: { lat: number; lng: number } | null;
  status: LocationStatus;
  error: string | null;
  setLocation: (coords: { lat: number; lng: number }) => void;
  setStatus: (status: LocationStatus) => void;
  setError: (message: string | null) => void;
  reset: () => void;
}

// Store d'authentification
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,
      login: async (email: string, password: string) => {
        // Pour la démo, on mappe l'utilisateur sur driver1 afin de voir trajets/motos/demandes
        const mockUser: User = {
          id: 'driver1',
          name: email.split('@')[0],
          email,
          role: 'driver',
          verified: true,
          location: {
            lat: 6.1256,
            lng: 1.2317,
          },
        };
        set({ user: mockUser, isLoggedIn: true });
      },
      register: async (name: string, email: string, password: string) => {
        // Pour la démo, on mappe aussi sur driver1 pour accéder aux données mock
        const mockUser: User = {
          id: 'driver1',
          name,
          email,
          role: 'driver',
          verified: true,
          location: {
            lat: 6.1256,
            lng: 1.2317,
          },
        };
        set({ user: mockUser, isLoggedIn: true });
      },
      logout: () => {
        set({ user: null, isLoggedIn: false });
      },
      updateUser: (userData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

// Store des motos
export const useMotosStore = create<MotosStore>()((set, get) => ({
  motos: [
    {
      id: '1',
      driverId: 'driver1',
      brand: 'Honda',
      model: 'CB150',
      year: 2022,
      licensePlate: 'TG-2022-001',
      capacity: 2,
    },
    {
      id: '2',
      driverId: 'driver2',
      brand: 'Yamaha',
      model: 'YZF-R3',
      year: 2023,
      licensePlate: 'TG-2023-045',
      capacity: 2,
    },
  ],
  addMoto: (moto) => {
    set((state) => ({
      motos: [...state.motos, moto],
    }));
  },
  removeMoto: (id) => {
    set((state) => ({
      motos: state.motos.filter((m) => m.id !== id),
    }));
  },
  updateMoto: (id, data) => {
    set((state) => ({
      motos: state.motos.map((m) => (m.id === id ? { ...m, ...data } : m)),
    }));
  },
  getMotosByDriver: (driverId) => {
    return get().motos.filter((m) => m.driverId === driverId);
  },
}));

// Store des trajets
export const useRoutesStore = create<RoutesStore>()((set, get) => ({
  routes: [
    {
      id: '1',
      driverId: 'driver1',
      driver: {
        id: 'driver1',
        name: 'Jean Dupont',
        email: 'jean@univ-lome.tg',
        role: 'driver',
        verified: true,
        location: { lat: 6.1256, lng: 1.2317 },
      },
      departure: {
        name: 'Campus Principal',
        lat: 6.1256,
        lng: 1.2317,
      },
      arrival: {
        name: 'Centre Ville',
        lat: 6.1300,
        lng: 1.2400,
      },
      departureTime: '07:30',
      arrivalTime: '08:00',
      daysOfWeek: [1, 2, 3, 4, 5],
      availableSeats: 1,
      moto: {
        id: '1',
        driverId: 'driver1',
        brand: 'Honda',
        model: 'CB150',
        year: 2022,
        licensePlate: 'TG-2022-001',
        capacity: 2,
      },
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      driverId: 'driver2',
      driver: {
        id: 'driver2',
        name: 'Marie Koffi',
        email: 'marie@univ-lome.tg',
        role: 'driver',
        verified: true,
        location: { lat: 6.1200, lng: 1.2350 },
      },
      departure: {
        name: 'Gare Routière',
        lat: 6.1200,
        lng: 1.2350,
      },
      arrival: {
        name: 'Campus Principal',
        lat: 6.1256,
        lng: 1.2317,
      },
      departureTime: '17:00',
      arrivalTime: '17:30',
      daysOfWeek: [1, 2, 3, 4, 5],
      availableSeats: 2,
      moto: {
        id: '2',
        driverId: 'driver2',
        brand: 'Yamaha',
        model: 'YZF-R3',
        year: 2023,
        licensePlate: 'TG-2023-045',
        capacity: 2,
      },
      createdAt: new Date().toISOString(),
    },
  ],
  addRoute: (route) => {
    set((state) => ({
      routes: [...state.routes, route],
    }));
  },
  getRoutes: (filters) => {
    let filtered = get().routes;
    
    if (filters?.departure) {
      filtered = filtered.filter((r) =>
        r.departure.name.toLowerCase().includes(filters.departure.toLowerCase())
      );
    }
    
    if (filters?.arrival) {
      filtered = filtered.filter((r) =>
        r.arrival.name.toLowerCase().includes(filters.arrival.toLowerCase())
      );
    }
    
    if (filters?.dayOfWeek) {
      filtered = filtered.filter((r) =>
        r.daysOfWeek.includes(filters.dayOfWeek)
      );
    }
    
    return filtered;
  },
  updateRoute: (id, routeData) => {
    set((state) => ({
      routes: state.routes.map((r) =>
        r.id === id ? { ...r, ...routeData } : r
      ),
    }));
  },
  deleteRoute: (id) => {
    set((state) => ({
      routes: state.routes.filter((r) => r.id !== id),
    }));
  },
  getRoutesByDriver: (driverId) => {
    return get().routes.filter((r) => r.driverId === driverId);
  },
  createRoute: (data) => {
    const mockDriver = {
      id: data.driverId,
      name: 'Nouvel Conducteur',
      email: 'driver@univ-lome.tg',
      role: 'driver' as const,
      verified: true,
      location: { lat: 6.1256, lng: 1.2317 },
    };

    const mockMoto = {
      id: `moto-${Date.now()}`,
      driverId: data.driverId,
      brand: 'Moto',
      model: 'Standard',
      year: 2024,
      licensePlate: 'TG-2024-001',
      capacity: 2,
    };

    const newRoute: Route = {
      id: `route-${Date.now()}`,
      driverId: data.driverId,
      driver: mockDriver,
      departure: {
        name: data.departure,
        lat: 6.1256,
        lng: 1.2317,
      },
      arrival: {
        name: data.arrival,
        lat: 6.1300,
        lng: 1.2400,
      },
      departureTime: data.time,
      arrivalTime: data.time,
      daysOfWeek: [1, 2, 3, 4, 5],
      availableSeats: data.availableSeats,
      moto: mockMoto,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      routes: [...state.routes, newRoute],
    }));
  },
}));

// Store des demandes de trajet
export const useRideRequestsStore = create<RideRequestsStore>()((set, get) => ({
  requests: [],
  addRequest: (request) => {
    set((state) => ({
      requests: [...state.requests, request],
    }));
  },
  updateRequestStatus: (id, status) => {
    set((state) => ({
      requests: state.requests.map((r) =>
        r.id === id ? { ...r, status, respondedAt: new Date().toISOString() } : r
      ),
    }));
  },
  getRequestsByPassenger: (passengerId) => {
    return get().requests.filter((r) => r.passengerId === passengerId);
  },
  getRequestsByDriver: (driverId) => {
    const allRequests = get().requests;
    const driverRoutes = useRoutesStore.getState().routes.filter((r: Route) => r.driverId === driverId);
    return allRequests.filter((r) =>
      driverRoutes.some((route: Route) => route.id === r.routeId)
    );
  },
}));

// Store de localisation (permission + coordonnées)
export const useLocationStore = create<LocationStore>()((set) => ({
  location: null,
  status: 'idle',
  error: null,
  setLocation: (coords) => set({ location: coords }),
  setStatus: (status) => set({ status }),
  setError: (message) => set({ error: message }),
  reset: () => set({ location: null, status: 'idle', error: null }),
}));
