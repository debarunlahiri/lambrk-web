import { Footprints } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stride Privacy Policy | Lambrk",
  description:
    "Learn how the Stride Android app uses step counting, optional Health Connect access, approximate location for air quality, and crash reports.",
};

const linkClass = "font-medium underline underline-offset-4";
const listClass = "mt-3 list-disc space-y-1.5 pl-5";

export default function StridePrivacyPolicyPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-14">
      <article className="rounded-2xl border border-border bg-card px-5 py-7 sm:px-10 sm:py-10">
        <header className="border-b border-border pb-7">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Footprints aria-hidden="true" className="size-5" />
            Stride for Android
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Stride Privacy Policy
          </h1>
          <p className="mt-3 text-sm">
            Last updated <time dateTime="2026-11-09">November 9, 2026</time>
          </p>
          <p className="mt-4 leading-relaxed">
            This policy applies to the Stride Android app (com.lambrk.stride).
            Stride counts your steps, shows activity and health trends, and
            shows air quality for a location you choose. You can use the app
            without an account. Lambrk does not run a server that receives your
            health or activity data.
          </p>
        </header>

        <div className="mt-7 space-y-8 leading-relaxed [&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-semibold [&_p+p]:mt-3">
          <section aria-labelledby="summary">
            <h2 id="summary">Summary</h2>
            <ul className={listClass}>
              <li>
                Your steps, goals, saved cities, and air quality history are
                stored on your device only.
              </li>
              <li>
                Health Connect access is optional and read-only. Stride never
                writes to Health Connect and never uploads what it reads.
              </li>
              <li>
                Air quality and city search work by sending map coordinates or a
                city name you typed to Google services. Your steps and health
                data are never part of those requests.
              </li>
              <li>
                Location is optional, approximate, requested only when you tap
                “Use my location,” and never tracked in the background.
              </li>
              <li>
                Stride uses Firebase Crashlytics to receive crash reports. You
                can turn this off in Settings.
              </li>
              <li>
                Stride has no advertising, no analytics SDK, and does not sell
                personal data.
              </li>
            </ul>
          </section>

          <section aria-labelledby="steps">
            <h2 id="steps">Step counting and activity</h2>
            <p>
              Stride reads your phone’s built-in step counter sensor to count
              steps. Android requires the Physical activity permission for
              this, which Stride requests when you choose to turn on step
              counting. The sensor is read only while the app is on screen.
            </p>
            <p>
              Stride stores your daily step totals for the last 14 days in
              Android’s private app storage, together with the bookkeeping it
              needs to handle day changes and device restarts. Calories burned
              and exercise minutes shown in Stride are estimates calculated on
              your device from your step count. If you decline the permission,
              Stride still works but cannot count steps with the sensor.
            </p>
          </section>

          <section aria-labelledby="health-connect">
            <h2 id="health-connect">Optional Health Connect access</h2>
            <p>
              If you connect Health Connect, Stride asks for permission to read
              the following data types, and you choose which ones to allow:
              steps, distance, active calories, exercise sessions, heart rate,
              sleep, hydration, and weight. Stride requests read access only.
              It does not write, change, or delete anything in Health Connect.
            </p>
            <p>
              Stride reads recent data, such as the last seven days of
              activity, today’s heart rate, your most recent night of sleep,
              today’s water intake, your latest weight, and recent workouts.
              Stride keeps this data in memory to display it and does not save
              a copy in its own storage or send it anywhere. When Health
              Connect has step data, Stride shows it in place of the phone
              sensor count, because Health Connect already combines duplicate
              data from different apps and devices. Stride shows the name of
              the app that recorded each reading when Android makes it
              available.
            </p>
            <p>
              Stride’s use of information received from Health Connect
              follows Google Play’s Health Connect permissions policy,
              including its Limited Use requirements. Stride does not use
              Health Connect data for advertising, does not sell it, and does
              not share it with third parties. You can review or remove
              Stride’s access at any time in Health Connect.
            </p>
          </section>

          <section aria-labelledby="air-quality">
            <h2 id="air-quality">Air quality and location</h2>
            <p>
              To show air quality, Stride sends the latitude and longitude of
              the location you selected to the Google Air Quality API. Google
              returns air quality index values, pollutant measurements,
              forecasts, recent history, and health guidance for that place.
              Your device’s language setting is also included so the
              descriptions use your language. The request does not include your
              steps, health data, name, or any account information.
            </p>
            <p>
              You can pick a location in two ways. If you choose a city by name,
              no device location is used. If you tap “Use my location,” Stride
              asks for Android’s approximate location permission and requests a
              single location fix through Google Play services’ Fused Location
              Provider. Stride does not track you continuously, does not
              request background location, and does not ask for precise
              location.
            </p>
            <p>
              Stride saves the locations you choose (name, region, and
              coordinates), including a “current location” entry if you used
              your location, so it can show them without asking again. For each
              saved location, Stride keeps the latest air quality reading and a
              history of readings it has retrieved (up to 1,500 entries per
              location) on your device so you can see trends and use the app
              offline. Stride never invents history for periods when it did not
              retrieve data. Removing a location in the app deletes its saved
              readings and history.
            </p>
            <p>
              The nearby cities map finds places by sampling points around your
              selected location. Stride sends those nearby coordinates to
              Google to name each place and to get its current air quality.
              Nearby results are kept in memory only and are not saved.
            </p>
          </section>

          <section aria-labelledby="maps">
            <h2 id="maps">City search, place names, and maps</h2>
            <p>
              When you search for a city, the text you type is sent to the
              Google Geocoding API to find matching places and their
              coordinates. Stride also uses Google’s geocoding to name nearby
              cities. When you use “Use my location,” Android’s built-in
              geocoder may be used to turn your coordinates into a place name;
              how that works depends on your device and its system services.
            </p>
            <p>
              The nearby cities screen displays a Google Map using the Google
              Maps SDK for Android. Google processes information needed to
              deliver the map, such as your device and network details, under
              its own privacy policy.
            </p>
            <p>
              Requests to Google services include Stride’s package name and
              app signing certificate fingerprint, which identify the app to
              Google, along with an API key. Like any internet request, they
              also reveal your IP address to Google.
            </p>
          </section>

          <section aria-labelledby="preferences">
            <h2 id="preferences">Goals and preferences</h2>
            <p>
              Stride stores the daily goals you set (steps, exercise minutes,
              and calories), your selected air quality standard, your active
              location, and your crash report choice in Android’s private app
              storage so your choices persist between sessions. These settings
              contain no health readings.
            </p>
          </section>

          <section aria-labelledby="crash-reports">
            <h2 id="crash-reports">Crash reports</h2>
            <p>
              Stride uses Firebase Crashlytics, a Google service, to find and
              fix crashes. When a crash occurs, a report is sent that can
              include technical details such as the stack trace, app version,
              device model, Android version, the state of the app at the time of
              the crash, a Firebase installation identifier, and the IP address
              from which the report was sent. Stride does not attach your steps,
              health data, location, or other personal information to reports,
              and error messages are kept free of that data.
            </p>
            <p>
              Crash reporting is on by default. You can turn it off at any time
              in <strong>Settings</strong> by switching off{" "}
              <strong>Send crash reports</strong>. While it is off, Stride does
              not send reports. Google processes crash report data under
              Firebase’s terms and retains it for a limited period, currently
              about 90 days.
            </p>
          </section>

          <section aria-labelledby="permissions">
            <h2 id="permissions">Android permissions</h2>
            <p>Stride requests only the permissions it needs:</p>
            <ul className={listClass}>
              <li>
                <strong>Physical activity</strong> to read the step counter.
              </li>
              <li>
                <strong>Approximate location</strong> only if you choose “Use
                my location” for air quality.
              </li>
              <li>
                <strong>Health Connect read permissions</strong> for the data
                types you allow.
              </li>
              <li>
                <strong>Internet access</strong> for air quality, city search,
                maps, and crash reports.
              </li>
            </ul>
            <p>
              You can change or revoke any permission in Android’s app
              settings. If you deny a permission, the related feature turns off
              and the rest of Stride keeps working.
            </p>
          </section>

          <section aria-labelledby="backup">
            <h2 id="backup">Android Backup</h2>
            <p>
              Stride turns off Android’s automatic backup and excludes its data
              from cloud backup and device-to-device transfer. Your steps,
              goals, saved locations, and air quality history are therefore not
              copied to your Google account or to a new phone. If you set up a
              new device, Stride starts empty.
            </p>
          </section>

          <section aria-labelledby="sharing">
            <h2 id="sharing">Data collection and sharing</h2>
            <p>
              Lambrk does not receive your steps, health data, location, or
              settings. Stride contains no advertising and no analytics SDK,
              does not collect advertising identifiers, and does not sell
              personal data.
            </p>
            <p>The services Stride relies on, and what each one receives:</p>
            <ul className={listClass}>
              <li>
                <strong>Google Air Quality API:</strong> coordinates of the
                selected place and your language setting.
              </li>
              <li>
                <strong>Google Geocoding API:</strong> city names you type and
                coordinates used to name places.
              </li>
              <li>
                <strong>Google Maps SDK for Android:</strong> map requests
                needed to draw the nearby cities map.
              </li>
              <li>
                <strong>Google Play services (Fused Location Provider):</strong>{" "}
                a one-time approximate location fix, only when you ask for it.
              </li>
              <li>
                <strong>Firebase Crashlytics:</strong> crash reports, if you
                leave crash reporting on.
              </li>
              <li>
                <strong>Health Connect:</strong> provides your health records
                to Stride on your device; nothing is sent back.
              </li>
            </ul>
            <p>
              These services operate independently of Stride, may process data
              in countries other than your own, and handle information under
              their own privacy policies and your Android and Google account
              settings.
            </p>
          </section>

          <section aria-labelledby="security">
            <h2 id="security">Security</h2>
            <p>
              Stride sends data over encrypted HTTPS connections only and
              blocks unencrypted traffic. Data that Stride stores lives in
              Android’s private app storage, which other apps cannot read on a
              device that has not been tampered with. No method of storage or
              transmission is perfectly secure, and Stride cannot guarantee
              absolute security.
            </p>
          </section>

          <section aria-labelledby="deletion">
            <h2 id="deletion">Retention and deletion</h2>
            <p>
              Stride keeps daily step totals for 14 days. Goals, preferences,
              saved locations, and air quality history stay on your device
              until you change or remove them, clear Stride’s storage in
              Android settings, or uninstall the app. In the app you can use{" "}
              <strong>Reset to defaults</strong> to restore your goals and
              remove a saved location to delete its readings and history.
              Clearing Stride’s storage or uninstalling removes all data that
              Stride holds. Data in Health Connect is managed in Health Connect
              and is not deleted by Stride.
            </p>
            <p>
              Crash reports already sent to Firebase are retained by Google for
              a limited period. To ask about a report, contact us using the
              email address below.
            </p>
          </section>

          <section aria-labelledby="choices">
            <h2 id="choices">Your choices and rights</h2>
            <p>
              Because your data stays on your device, you can view, change,
              export from the screens that display it, and delete it yourself
              using the controls described above. Depending on where you live,
              you may also have legal rights regarding personal data, such as
              access, correction, deletion, or objection. Lambrk does not hold
              your activity or health data, but if you have a privacy question
              or request, contact us and we will respond.
            </p>
          </section>

          <section aria-labelledby="health-notice">
            <h2 id="health-notice">Not medical advice</h2>
            <p>
              Stride is not a medical device. Activity, health, and air quality
              information, including outdoor activity guidance, is general
              information and is not a diagnosis, treatment, or personal
              medical clearance. Talk to a qualified professional about health
              decisions and follow local public-health guidance.
            </p>
          </section>

          <section aria-labelledby="children">
            <h2 id="children">Children</h2>
            <p>
              Stride is not directed to children under 13 and Lambrk does not
              knowingly collect personal information from them.
            </p>
          </section>

          <section aria-labelledby="contact">
            <h2 id="contact">Contact</h2>
            <p>
              For privacy questions or requests about Stride, email Lambrk at{" "}
              <a className={linkClass} href="mailto:contact@lambrk.com">
                contact@lambrk.com
              </a>
              .
            </p>
          </section>

          <section aria-labelledby="updates">
            <h2 id="updates">Changes to this policy</h2>
            <p>
              If Stride’s data practices change, the revised policy will be
              published on this page with an updated date.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
