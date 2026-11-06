import { Compass } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compass Privacy Policy | Lambrk",
  description:
    "Learn how the Compass Android app uses device sensors, optional location access, and saved preferences.",
};

export default function CompassPrivacyPolicyPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-14">
      <article className="rounded-2xl border border-border bg-card px-5 py-7 sm:px-10 sm:py-10">
        <header className="border-b border-border pb-7">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Compass aria-hidden="true" className="size-5" />
            Compass for Android
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Compass Privacy Policy
          </h1>
          <p className="mt-3 text-sm">
            Last updated <time dateTime="2026-11-06">November 6, 2026</time>
          </p>
          <p className="mt-4 leading-relaxed">
            This policy applies to the Compass Android app
            (com.lambrk.compass). Compass processes sensor readings and optional
            location on your device. You can use the app without an account.
          </p>
        </header>

        <div className="mt-7 space-y-8 leading-relaxed [&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-semibold [&_p+p]:mt-3">
          <section aria-labelledby="sensors">
            <h2 id="sensors">Device sensors</h2>
            <p>
              Compass uses available motion, orientation, and magnetic field
              sensors to calculate your heading and show how level your device
              is. If you use the ambient theme and your device has a light
              sensor, Compass uses the light reading to switch between light
              and dark appearance. Compass processes these readings in memory
              and keeps no sensor history.
            </p>
          </section>

          <section aria-labelledby="location">
            <h2 id="location">Optional location access for True north</h2>
            <p>
              True north is off by default. When you enable it, Compass uses
              Android location services with your permission to calculate
              magnetic declination, the angle between magnetic north and
              geographic north at your location. The calculation uses latitude,
              longitude, altitude, and the current time on your device. Compass
              works with approximate location and can receive precise location
              if you grant it.
            </p>
            <p>
              Compass can use Android’s last known location. If none is
              available, it makes a short request for a single location fix.
              Compass may repeat the lookup when you enable True north again or
              start the app with the feature still enabled. Compass keeps the
              result in memory and does not save a location history or request
              background location access.
            </p>
            <p>
              You can turn off True north in Compass settings or revoke
              location access in Android’s app settings. If location is
              unavailable or permission is denied, Compass can still show
              magnetic north on supported devices.
            </p>
          </section>

          <section aria-labelledby="preferences">
            <h2 id="preferences">Saved preferences and Android Backup</h2>
            <p>
              Compass stores preferences such as theme, light threshold,
              dynamic color, True north, level display, vibration, screen-on
              behavior, and heading smoothing in Android’s private app storage
              so your choices persist between sessions.
            </p>
            <p>
              Depending on your device and backup settings, Android may copy
              these preferences to a system backup or transfer them to another
              device. Android manages backup and restore separately from
              Compass. The app’s saved preferences contain no location or
              sensor readings.
            </p>
          </section>

          <section aria-labelledby="sharing">
            <h2 id="sharing">Data collection and sharing</h2>
            <p>
              Compass does not send location, sensor readings, or preferences
              to the developer, advertisers, or analytics providers. The app
              contains no advertising, analytics, or third-party crash
              reporting SDKs, and it does not collect advertising identifiers
              or sell personal data.
            </p>
            <p>
              Android location services, Android Backup, and Google Play
              operate independently of Compass. Their handling of data depends
              on the service and your device or account settings.
            </p>
          </section>

          <section aria-labelledby="deletion">
            <h2 id="deletion">Retention and deletion</h2>
            <p>
              Location and sensor readings are used temporarily in memory.
              Your preferences stay in app storage until you reset them, clear
              Compass’s storage in Android settings, or uninstall the app. Use{" "}
              <strong>Reset to defaults</strong> in Compass settings to remove
              your saved preferences and restore the default settings. Use your
              device or backup provider’s controls to manage any existing
              backup copies.
            </p>
          </section>

          <section aria-labelledby="contact">
            <h2 id="contact">Contact</h2>
            <p>
              For privacy questions or requests about Compass, email Lambrk at{" "}
              <a
                className="font-medium underline underline-offset-4"
                href="mailto:contact@lambrk.com"
              >
                contact@lambrk.com
              </a>
              .
            </p>
          </section>

          <section aria-labelledby="updates">
            <h2 id="updates">Changes to this policy</h2>
            <p>
              If Compass’s data practices change, the revised policy will be
              published on this page with an updated date.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
