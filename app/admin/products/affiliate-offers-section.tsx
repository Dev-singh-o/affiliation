"use client";

import { useEffect, useState } from "react";
import { useTransition } from "react";
import { toast } from "sonner";
import { PlusIcon, Trash2Icon } from "lucide-react";

import {
  createAffiliateOffer,
  updateAffiliateOffer,
  deleteAffiliateOffer,
} from "@/actions/affiliate-offers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import type { AffiliateOfferInput } from "@/lib/validation/catalog";

interface Offer extends AffiliateOfferInput {
  id: string;
}

const defaults: AffiliateOfferInput = {
  retailerName: "",
  affiliateNetwork: undefined,
  affiliateUrl: "",
  offerLabel: undefined,
  displayedPrice: undefined,
  originalPrice: undefined,
  currency: undefined,
  availabilityStatus: "UNKNOWN",
  isPrimary: false,
  trackingLabel: undefined,
  status: "ACTIVE",
};

function OfferForm({
  productId,
  initial,
  offerId,
  onDone,
}: {
  productId: string;
  initial: AffiliateOfferInput;
  offerId?: string;
  onDone: () => void;
}) {
  const [values, setValues] = useState<AffiliateOfferInput>(initial);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = offerId
        ? await updateAffiliateOffer(offerId, values)
        : await createAffiliateOffer(productId, values);
      if (result.ok) {
        toast.success(offerId ? "Offer updated" : "Offer created");
        onDone();
      } else toast.error(result.error);
    });
  }

  return (
    <form className="grid gap-3" onSubmit={submit}>
      <div className="grid gap-2">
        <Label>Retailer name</Label>
        <Input
          value={values.retailerName}
          onChange={(e) =>
            setValues((v) => ({ ...v, retailerName: e.target.value }))
          }
        />
      </div>
      <div className="grid gap-2">
        <Label>Affiliate URL</Label>
        <Input
          value={values.affiliateUrl}
          onChange={(e) =>
            setValues((v) => ({ ...v, affiliateUrl: e.target.value }))
          }
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label>Network</Label>
          <Input
            value={values.affiliateNetwork ?? ""}
            onChange={(e) =>
              setValues((v) => ({
                ...v,
                affiliateNetwork: e.target.value || undefined,
              }))
            }
          />
        </div>
        <div className="grid gap-2">
          <Label>Offer label</Label>
          <Input
            value={values.offerLabel ?? ""}
            onChange={(e) =>
              setValues((v) => ({
                ...v,
                offerLabel: e.target.value || undefined,
              }))
            }
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="grid gap-2">
          <Label>Displayed price</Label>
          <Input
            type="number"
            step="0.01"
            value={values.displayedPrice ?? ""}
            onChange={(e) =>
              setValues((v) => ({
                ...v,
                displayedPrice:
                  e.target.value === "" ? undefined : Number(e.target.value),
              }))
            }
          />
        </div>
        <div className="grid gap-2">
          <Label>Original price</Label>
          <Input
            type="number"
            step="0.01"
            value={values.originalPrice ?? ""}
            onChange={(e) =>
              setValues((v) => ({
                ...v,
                originalPrice:
                  e.target.value === "" ? undefined : Number(e.target.value),
              }))
            }
          />
        </div>
        <div className="grid gap-2">
          <Label>Currency</Label>
          <Input
            value={values.currency ?? ""}
            onChange={(e) =>
              setValues((v) => ({
                ...v,
                currency: e.target.value || undefined,
              }))
            }
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label>Availability</Label>
          <select
            className="border-input flex h-9 rounded-md border bg-transparent px-3 text-sm"
            value={values.availabilityStatus}
            onChange={(e) =>
              setValues((v) => ({
                ...v,
                availabilityStatus: e.target
                  .value as AffiliateOfferInput["availabilityStatus"],
              }))
            }
          >
            <option value="UNKNOWN">Unknown</option>
            <option value="IN_STOCK">In stock</option>
            <option value="OUT_OF_STOCK">Out of stock</option>
            <option value="PREORDER">Preorder</option>
          </select>
        </div>
        <div className="grid gap-2">
          <Label>Tracking label</Label>
          <Input
            value={values.trackingLabel ?? ""}
            onChange={(e) =>
              setValues((v) => ({
                ...v,
                trackingLabel: e.target.value || undefined,
              }))
            }
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={values.isPrimary}
            onChange={(e) =>
              setValues((v) => ({ ...v, isPrimary: e.target.checked }))
            }
          />{" "}
          Primary offer
        </label>
        <select
          className="border-input h-9 rounded-md border bg-transparent px-2 text-sm"
          value={values.status}
          onChange={(e) =>
            setValues((v) => ({
              ...v,
              status: e.target.value as AffiliateOfferInput["status"],
            }))
          }
        >
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Saving…" : offerId ? "Update offer" : "Create offer"}
        </Button>
      </div>
    </form>
  );
}

export function AffiliateOffersSection({ productId }: { productId: string }) {
  const [offers, setOffers] = useState<Offer[] | null>(null);
  const [editing, setEditing] = useState<Offer | null>(null);
  const [creating, setCreating] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    void load();
  }, [productId]);

  async function load() {
    const res = await fetch(`/api/admin/affiliate-offers?productId=${productId}`);
    if (res.ok) setOffers((await res.json()) as Offer[]);
  }

  function closeForm() {
    setCreating(false);
    setEditing(null);
    void load();
  }

  if (offers === null) {
    return <p className="text-muted-foreground text-sm">Loading offers…</p>;
  }

  return (
    <div className="grid gap-4">
      {offers.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No affiliate offers yet. Add at least one to make the product
          purchasable.
        </p>
      ) : (
        <ul className="divide-y">
          {offers.map((offer) => (
            <li
              key={offer.id}
              className="flex flex-wrap items-center justify-between gap-3 py-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{offer.retailerName}</span>
                  {offer.isPrimary ? (
                    <Badge variant="default">Primary</Badge>
                  ) : null}
                  {offer.status === "INACTIVE" ? (
                    <Badge variant="outline">Inactive</Badge>
                  ) : null}
                </div>
                <p className="text-muted-foreground truncate text-xs">
                  {offer.affiliateUrl}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditing(offer);
                    setCreating(false);
                  }}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={pending}
                  onClick={() => {
                    if (!confirm("Delete this offer?")) return;
                    startTransition(async () => {
                      const result = await deleteAffiliateOffer(offer.id);
                      if (result.ok) {
                        toast.success("Deleted");
                        await load();
                      } else toast.error(result.error);
                    });
                  }}
                >
                  <Trash2Icon />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {creating || editing ? (
        <div className="rounded-lg border p-4">
          <h3 className="mb-3 font-medium">
            {editing ? "Edit offer" : "New offer"}
          </h3>
          <OfferForm
            productId={productId}
            initial={editing ?? defaults}
            offerId={editing?.id}
            onDone={closeForm}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-2"
            onClick={() => {
              setCreating(false);
              setEditing(null);
            }}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          onClick={() => {
            setEditing(null);
            setCreating(true);
          }}
        >
          <PlusIcon />
          Add affiliate offer
        </Button>
      )}
    </div>
  );
}
