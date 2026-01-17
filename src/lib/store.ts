import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: "visiteur" | "passager" | "conducteur" | "administrateur";
  statut: string;
  avatar?: string;
  phone?: string;
}

export interface Notification {
  id: string;
  userId: string;
  titre: string;
  message: string;
  lu: boolean;
  type: "info" | "success" | "warning" | "error";
  createdAt: string;
}

export interface Moto {
  id: string;
  proprietaireId: string;
  marque: string;
  modele: string;
  immatriculation: string;
  disponibilite: boolean;
}

export interface Trajet {
  id: string;
  conducteurId: string;
  conducteur: User;
  pointDepart: string;
  destination: string;
  dateHeure: string;
  placesDisponibles: number;
  statut: string;
  departureLat?: number;
  departureLng?: number;
  arrivalLat?: number;
  arrivalLng?: number;
  createdAt: string;
}

export interface Reservation {
  id: string;
  trajetId: string;
  etudiantId: string;
  statut: "en_attente" | "confirmé" | "refusé" | "terminé" | "annulé";
  createdAt: string;
}

interface AuthStore {
  user: User | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    nom: string,
    prenom: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
  updateUser: (user: Partial<User>) => Promise<void>;
  updatePassword: (data: Record<string, string>) => Promise<void>;
  deleteAccount: (id: string) => void;
}

interface MotosStore {
  motos: Moto[];
  addMoto: (moto: Moto) => void;
  removeMoto: (id: string) => void;
  updateMoto: (id: string, data: Partial<Moto>) => void;
  getMotosByDriver: (driverId: string) => Moto[];
}

interface TrajetsStore {
  trajets: Trajet[];
  addTrajet: (trajet: Trajet) => void;
  createTrajet: (data: {
    pointDepart: string;
    destination: string;
    dateHeure: string;
    placesDisponibles: number;
    conducteurId: string;
  }) => void;
  getTrajets: (filters?: {
    pointDepart?: string;
    destination?: string;
  }) => Trajet[];
  updateTrajet: (id: string, trajet: Partial<Trajet>) => void;
  deleteTrajet: (id: string) => void;
  getTrajetsByDriver: (driverId: string) => Trajet[];
}

interface ReservationsStore {
  reservations: Reservation[];
  addReservation: (reservation: Reservation) => void;
  updateReservationStatus: (id: string, statut: Reservation["statut"]) => void;
  getReservationsByPassenger: (passengerId: string) => Reservation[];
  getReservationsByDriver: (driverId: string) => Reservation[];
}

interface NotificationsStore {
  notifications: Notification[];
  addNotification: (
    notification: Omit<Notification, "id" | "createdAt" | "lu">
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: (userId: string) => void;
  deleteNotification: (id: string) => void;
  getNotificationsByUser: (userId: string) => Notification[];
}

type LocationStatus = "idle" | "prompting" | "granted" | "denied" | "error";

interface LocationStore {
  location: { lat: number; lng: number } | null;
  status: LocationStatus;
  error: string | null;
  setLocation: (coords: { lat: number; lng: number }) => void;
  setStatus: (status: LocationStatus) => void;
  setError: (message: string | null) => void;
  requestLocation: () => void;
  reset: () => void;
}

// Store d'authentification
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,
      login: async (email: string, password: string) => {
        try {
          const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(
              data.error?.message || "Erreur lors de la connexion"
            );
          }

          set({ user: data.data.user, isLoggedIn: true });
        } catch (error) {
          console.error("Login error:", error);
          throw error;
        }
      },
      register: async (
        nom: string,
        prenom: string,
        email: string,
        password: string
      ) => {
        try {
          const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nom, prenom, email, password }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(
              data.error?.message || "Erreur lors de l'inscription"
            );
          }

          set({ user: data.data.user, isLoggedIn: true });
        } catch (error) {
          console.error("Registration error:", error);
          throw error;
        }
      },
      logout: () => {
        fetch("/api/auth/logout", { method: "POST" }).catch(console.error);
        set({ user: null, isLoggedIn: false });
      },
      updateUser: async (userData: Partial<User>) => {
        try {
          const response = await fetch("/api/me", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(
              data.error?.message || "Erreur lors de la mise à jour du profil"
            );
          }

          set((state: AuthStore) => ({
            user: state.user ? { ...state.user, ...userData } : null,
          }));
        } catch (error) {
          console.error("Update user error:", error);
          throw error;
        }
      },
      updatePassword: async (passwordData: Record<string, string>) => {
        try {
          const response = await fetch("/api/me/password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(passwordData),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(
              data.error?.message || "Erreur lors du changement de mot de passe"
            );
          }
        } catch (error) {
          console.error("Update password error:", error);
          throw error;
        }
      },
      deleteAccount: (id: string) => {
        set((state: AuthStore) => ({
          user: state.user?.id === id ? null : state.user,
          isLoggedIn: state.user?.id === id ? false : state.isLoggedIn,
        }));
      },
    }),
    {
      name: "auth-storage",
    }
  )
);

// Store des motos
export const useMotosStore = create<MotosStore>()((set, get) => ({
  motos: [
    {
      id: "1",
      proprietaireId: "driver1",
      marque: "Honda",
      modele: "CB150",
      immatriculation: "TG-2022-001",
      disponibilite: true,
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
    return get().motos.filter((m) => m.proprietaireId === driverId);
  },
}));

// Store des trajets
export const useTrajetsStore = create<TrajetsStore>()((set, get) => ({
  trajets: [
    {
      id: "1",
      conducteurId: "driver1",
      conducteur: {
        id: "driver1",
        nom: "Dupont",
        prenom: "Jean",
        email: "jean@univ-lome.tg",
        role: "conducteur", // Fixed inconsistent role in mock data
        statut: "actif",
      },
      pointDepart: "Campus Principal",
      destination: "Centre Ville",
      dateHeure: "2026-01-16T07:30:00",
      placesDisponibles: 1,
      statut: "ouvert",
      departureLat: 6.1256,
      departureLng: 1.2317,
      arrivalLat: 6.13,
      arrivalLng: 1.24,
      createdAt: new Date().toISOString(),
    },
  ],
  addTrajet: (trajet) => {
    set((state) => ({
      trajets: [...state.trajets, trajet],
    }));
  },
  getTrajets: (filters) => {
    let filtered = get().trajets;

    if (filters?.pointDepart) {
      const search = filters.pointDepart.toLowerCase();
      filtered = filtered.filter((r) =>
        r.pointDepart.toLowerCase().includes(search)
      );
    }

    if (filters?.destination) {
      const search = filters.destination.toLowerCase();
      filtered = filtered.filter((r) =>
        r.destination.toLowerCase().includes(search)
      );
    }

    return filtered;
  },
  updateTrajet: (id, trajetData) => {
    set((state) => ({
      trajets: state.trajets.map((r) =>
        r.id === id ? { ...r, ...trajetData } : r
      ),
    }));
  },
  deleteTrajet: (id) => {
    set((state) => ({
      trajets: state.trajets.filter((r) => r.id !== id),
    }));
  },
  getTrajetsByDriver: (driverId) => {
    return get().trajets.filter((r) => r.conducteurId === driverId);
  },
  createTrajet: (data) => {
    const coordsBook: Record<string, { lat: number; lng: number }> = {
      "campus principal": { lat: 6.1256, lng: 1.2317 },
      "centre ville": { lat: 6.13, lng: 1.24 },
    };

    const resolve = (name: string) => {
      const key = name.trim().toLowerCase();
      return coordsBook[key] ?? { lat: 6.1256, lng: 1.2317 };
    };

    const startCoords = resolve(data.pointDepart);
    const endCoords = resolve(data.destination);

    const newTrajet: Trajet = {
      id: `trajet-${Date.now()}`,
      conducteurId: data.conducteurId,
      conducteur: useAuthStore.getState().user!,
      pointDepart: data.pointDepart,
      destination: data.destination,
      dateHeure: data.dateHeure,
      placesDisponibles: data.placesDisponibles,
      statut: "ouvert",
      departureLat: startCoords.lat,
      departureLng: startCoords.lng,
      arrivalLat: endCoords.lat,
      arrivalLng: endCoords.lng,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      trajets: [...state.trajets, newTrajet],
    }));
  },
}));

// Store des réservations
export const useReservationsStore = create<ReservationsStore>()((set, get) => ({
  reservations: [],
  addReservation: (reservation) => {
    set((state) => ({
      reservations: [...state.reservations, reservation],
    }));
  },
  updateReservationStatus: (id, statut) => {
    set((state) => ({
      reservations: state.reservations.map((r) =>
        r.id === id ? { ...r, statut } : r
      ),
    }));
  },
  getReservationsByPassenger: (passengerId) => {
    return get().reservations.filter((r) => r.etudiantId === passengerId);
  },
  getReservationsByDriver: (driverId) => {
    const allTrajets = useTrajetsStore.getState().trajets;
    const driverTrajetsIds = allTrajets
      .filter((t) => t.conducteurId === driverId)
      .map((t) => t.id);
    return get().reservations.filter((r) =>
      driverTrajetsIds.includes(r.trajetId)
    );
  },
}));

// Store des notifications
export const useNotificationsStore = create<NotificationsStore>()(
  (set, get) => ({
    notifications: [
      {
        id: "1",
        userId: "driver1",
        titre: "Bienvenue",
        message: "Bienvenue sur la plateforme Miyi Ðekae !",
        lu: false,
        type: "info",
        createdAt: new Date().toISOString(),
      },
    ],
    addNotification: (notif) => {
      const newNotif: Notification = {
        ...notif,
        id: `notif-${Date.now()}`,
        lu: false,
        createdAt: new Date().toISOString(),
      };
      set((state) => ({
        notifications: [newNotif, ...state.notifications],
      }));
    },
    markAsRead: (id) => {
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, lu: true } : n
        ),
      }));
    },
    markAllAsRead: (userId) => {
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.userId === userId ? { ...n, lu: true } : n
        ),
      }));
    },
    deleteNotification: (id) => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }));
    },
    getNotificationsByUser: (userId) => {
      return get().notifications.filter((n) => n.userId === userId);
    },
  })
);

// Store de localisation (permission + coordonnées)
export const useLocationStore = create<LocationStore>()((set) => ({
  location: null,
  status: "idle",
  error: null,
  setLocation: (coords) => set({ location: coords }),
  setStatus: (status) => set({ status }),
  setError: (message) => set({ error: message }),
  requestLocation: () => {
    if (typeof window === "undefined" || !navigator?.geolocation) {
      set({ status: "error", error: "Géolocalisation non disponible" });
      return;
    }
    set({ status: "prompting", error: null });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        set({
          location: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          status: "granted",
          error: null,
        });
      },
      (err) => {
        const denied = err.code === err.PERMISSION_DENIED;
        set({ status: denied ? "denied" : "error", error: err.message });
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  },
  reset: () => set({ location: null, status: "idle", error: null }),
}));

interface SidebarStore {
  isOpen: boolean;
  isCollapsed: boolean;
  toggle: () => void;
  setOpen: (open: boolean) => void;
  setCollapsed: (collapsed: boolean) => void;
}

export const useSidebarStore = create<SidebarStore>()(
  persist(
    (set) => ({
      isOpen: false,
      isCollapsed: false,
      toggle: () => set((state: SidebarStore) => ({ isOpen: !state.isOpen })),
      setOpen: (open: boolean) => set({ isOpen: open }),
      setCollapsed: (collapsed: boolean) => set({ isCollapsed: collapsed }),
    }),
    {
      name: "sidebar-storage",
    }
  )
);
