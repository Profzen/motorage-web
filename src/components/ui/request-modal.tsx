"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import React from "react";

type RequestModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (requestedSeats: number) => void;
  trajetTitle?: string;
};

export function RequestModal({ open, onClose, onConfirm, trajetTitle }: RequestModalProps) {
  const [seats, setSeats] = React.useState("1");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <Card className="relative z-10 w-full max-w-md border-0 shadow-xl">
        <CardHeader>
          <CardTitle>Demander ce trajet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {trajetTitle && (
            <p className="text-sm text-muted-foreground">{trajetTitle}</p>
          )}
          <div className="space-y-2">
            <Label htmlFor="seats">Nombre de places</Label>
            <Input
              id="seats"
              type="number"
              min={1}
              max={2}
              value={seats}
              onChange={(e) => setSeats(e.target.value)}
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button className="flex-1" onClick={() => onConfirm(parseInt(seats || "1", 10))}>
              Envoyer la demande
            </Button>
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Annuler
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
