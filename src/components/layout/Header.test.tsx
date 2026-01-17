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

  it("affiche le bouton de connexion", async () => {
    render(<Header />);
    expect(await screen.findByText(/Connexion/i)).toBeInTheDocument();
  });
});
