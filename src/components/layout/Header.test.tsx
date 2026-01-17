import { render, screen } from "@testing-library/react";
import { Header } from "@/components/layout/Header";
import { describe, expect, it } from "vitest";

describe("Header Component", () => {
  it("affiche le logo Miyi Ðekae", () => {
    render(<Header />);
    expect(screen.getByText(/Miyi Ðekae/i)).toBeInTheDocument();
  });

  it("contient les liens de navigation", () => {
    render(<Header />);
    expect(screen.getByText(/À propos/i)).toBeInTheDocument();
    expect(screen.getByText(/Contact/i)).toBeInTheDocument();
  });

  it("affiche les boutons de connexion et d'inscription", () => {
    render(<Header />);
    expect(screen.getByText(/Connexion/i)).toBeInTheDocument();
    expect(screen.getByText(/Inscription/i)).toBeInTheDocument();
  });
});
