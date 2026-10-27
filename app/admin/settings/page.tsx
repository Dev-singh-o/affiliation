import { Suspense } from "react";
import type { Metadata } from "next";

import { getSettings } from "@/lib/settings";
import { BrandingSettingsForm } from "@/components/admin/branding-settings-form";
import { HomepageSettingsForm } from "@/components/admin/homepage-settings-form";
import { NavigationSettingsForm } from "@/components/admin/navigation-settings-form";
import { SocialSettingsForm } from "@/components/admin/social-settings-form";
import { SeoSettingsForm } from "@/components/admin/seo-settings-form";
import { AffiliateSettingsForm } from "@/components/admin/affiliate-settings-form";
import { GeneralSettingsForm } from "@/components/admin/general-settings-form";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata: Metadata = {
  title: "Settings",
  robots: { index: false, follow: false },
};

export default function SettingsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <SettingsContent />
    </Suspense>
  );
}

async function SettingsContent() {
  const settings = await getSettings();
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Website settings</h1>
        <p className="text-muted-foreground text-sm">
          Configure branding, homepage, navigation, social links, SEO, affiliate
          disclosure, and general options. Changes apply without redeployment.
        </p>
      </div>

      <Tabs defaultValue="branding">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="homepage">Homepage</TabsTrigger>
          <TabsTrigger value="navigation">Navigation</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="affiliate">Affiliate</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
        </TabsList>

        <TabsContent value="branding">
          <BrandingSettingsForm initial={settings.branding} />
        </TabsContent>
        <TabsContent value="homepage">
          <HomepageSettingsForm initial={settings.homepage} />
        </TabsContent>
        <TabsContent value="navigation">
          <NavigationSettingsForm initial={settings.navigation} />
        </TabsContent>
        <TabsContent value="social">
          <SocialSettingsForm initial={settings.social} />
        </TabsContent>
        <TabsContent value="seo">
          <SeoSettingsForm initial={settings.seo} />
        </TabsContent>
        <TabsContent value="affiliate">
          <AffiliateSettingsForm initial={settings.affiliate} />
        </TabsContent>
        <TabsContent value="general">
          <GeneralSettingsForm initial={settings.general} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
