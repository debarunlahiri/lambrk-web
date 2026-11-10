import type { Metadata } from "next";
import Image from "next/image";

const contactEmail = "contact@lambrk.com";
const deletionEmail = `mailto:${contactEmail}?subject=SplitEase%20account%20deletion%20request`;
const linkClass = "font-medium underline underline-offset-4";

export const metadata: Metadata = {
  title: "SplitEase Privacy Policy | Lambrk",
  description:
    "Learn how SplitEase handles accounts, shared expenses, receipts, notifications, and requests to delete your data.",
};

export default function SplitEasePrivacyPolicyPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-14">
      <article className="rounded-2xl border border-border bg-card px-5 py-7 sm:px-10 sm:py-10">
        <header className="border-b border-border pb-7">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Image
              src="/splitease-logo.png"
              alt=""
              width={28}
              height={28}
              className="rounded-lg"
            />
            SplitEase for Android
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            SplitEase Privacy Policy
          </h1>
          <p className="mt-3 text-sm">
            Last updated <time dateTime="2026-11-10">November 10, 2026</time>
          </p>
          <p className="mt-4 leading-relaxed">
            Lambrk operates SplitEase. This policy covers the SplitEase Android
            app (com.lambrk.splitease) and its related services, including group
            and friend invitations, account emails, and the iOS launch update
            signup. SplitEase stores shared expense records so you and your
            group can see who paid and what each person owes.
          </p>
          <p className="mt-4 text-sm">
            <a className={linkClass} href="#account-deletion">
              Request account and data deletion
            </a>
          </p>
        </header>

        <div className="mt-7 space-y-8 leading-relaxed [&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-semibold [&_p+p]:mt-3">
          <section aria-labelledby="accounts">
            <h2 id="accounts">Your account and sign-in</h2>
            <p>
              When you sign in with Google, SplitEase uses Firebase
              Authentication to verify your identity. SplitEase receives your
              verified email address, display name, account identifier and,
              when provided, a profile photo URL. The service uses this
              information to create or find your account and keep your groups
              and expenses connected to it.
            </p>
            <p>
              Where email and password registration is available, SplitEase
              stores your email address, display name, a password hash and
              email verification status. SplitEase uses session credentials and
              verification links to authenticate requests and verify account
              ownership.
            </p>
          </section>

          <section aria-labelledby="expenses">
            <h2 id="expenses">Groups, expenses, and settlements</h2>
            <p>
              SplitEase stores the groups and memberships you create or join,
              friend connections, and the expenses and settlements you record.
              These can include descriptions, amounts, dates, currencies,
              categories, payers, participants, and each person’s share.
              SplitEase uses these records to calculate balances, suggest
              settlements, and show relevant activity.
            </p>
            <p>
              Members of a group can see shared group records and the names
              associated with those records. Invites use links or an email
              address supplied by the sender. When an invitation is sent by
              email, SplitEase uses the address to deliver it. Share invitation
              links only with the people you intend to invite.
            </p>
            <p>
              A settlement records a payment you made outside SplitEase.
              SplitEase uses the information you enter to update the shared
              balance. If you purchase an app subscription, the store handles
              the payment separately.
            </p>
          </section>

          <section aria-labelledby="attachments">
            <h2 id="attachments">Receipts and attachments</h2>
            <p>
              If you add a receipt or another file to an expense, SplitEase
              uploads the file and stores its name and file type with the
              expense. Group members with access to that expense can open or
              download its attachments. Files can contain personal
              information, such as names, addresses, or partial card numbers.
              Check what a file contains before you share it with your group.
            </p>
          </section>

          <section aria-labelledby="device">
            <h2 id="device">Offline access and device storage</h2>
            <p>
              The Android app stores account information, saved preferences,
              cached group and expense data, and pending changes in app storage
              on your device. Selected attachments may be stored temporarily
              while waiting to upload. When connectivity returns, the app can
              send pending changes to SplitEase and refresh the local copy.
            </p>
            <p>
              Clearing SplitEase’s app storage or uninstalling it removes its
              local data from the device and can discard changes that have yet
              to sync. Data already synced to SplitEase remains on the service.
            </p>
          </section>

          <section aria-labelledby="communications">
            <h2 id="communications">Notifications and emails</h2>
            <p>
              SplitEase can use your email address to verify your account and
              send invitations or activity emails. If you enable push
              notifications, SplitEase stores a Firebase Cloud Messaging
              registration token and uses it to send notifications about
              relevant activity. You can manage notification preferences in
              SplitEase and turn off app notifications in Android settings.
            </p>
            <p>
              If you sign up for iOS launch updates, SplitEase stores your
              email address and signup and confirmation status. You can email{" "}
              <a className={linkClass} href={`mailto:${contactEmail}`}>
                {contactEmail}
              </a>{" "}
              to ask to be removed from the list.
            </p>
          </section>

          <section aria-labelledby="subscriptions">
            <h2 id="subscriptions">Subscriptions and store purchases</h2>
            <p>
              Where paid plans are available, the applicable app store
              processes the purchase. SplitEase receives purchase identifiers
              or verification information, the plan, and its status. SplitEase
              uses this information to verify the purchase and apply or
              restore plan benefits. Manage or cancel the subscription through
              the store where you purchased it.
            </p>
          </section>

          <section aria-labelledby="operations">
            <h2 id="operations">Technical information and service providers</h2>
            <p>
              SplitEase may record connection details such as an IP address,
              account and request identifiers, timestamps, and response
              status, along with limited request and response information.
              These logs help Lambrk diagnose errors and investigate misuse.
              API logging filters common sensitive fields and omits
              authentication request bodies and binary uploads.
            </p>
            <p>
              Lambrk uses service providers to host the service, store its
              data, deliver email, verify sign-in, deliver push notifications,
              and verify store purchases where available. Google and Firebase
              provide sign-in and push services. The applicable app store
              handles your store account and payment information under its
              own privacy policy.
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>
                <a className={linkClass} href="https://policies.google.com/privacy">
                  Google Privacy Policy
                </a>
              </li>
              <li>
                <a className={linkClass} href="https://firebase.google.com/support/privacy">
                  Privacy and Security in Firebase
                </a>
              </li>
            </ul>
          </section>

          <section aria-labelledby="retention">
            <h2 id="retention">Retention</h2>
            <p>
              SplitEase keeps account and shared expense data to operate the
              service and maintain the group’s records. Removing an expense
              hides it from the group’s active records. A deletion record may
              remain so other devices can sync the change. Email delivery
              records are eligible for cleanup once delivery has finished or
              failed and the record is more than 30 days old.
            </p>
            <p>
              Some information may need to be kept for security, fraud
              prevention, resolving disputes, or legal obligations. Copies
              downloaded or saved separately by other people are outside
              Lambrk’s control.
            </p>
          </section>

          <section aria-labelledby="account-deletion">
            <h2 id="account-deletion" className="scroll-mt-6">
              Request account and data deletion
            </h2>
            <p>
              To request deletion of your SplitEase account and associated
              data,{" "}
              <a className={linkClass} href={deletionEmail}>
                email Lambrk with a SplitEase account deletion request
              </a>
              . Send the request from the email address linked to your
              SplitEase account, if you can. Lambrk may ask for information to
              verify that the account belongs to you. Never send your
              password, verification codes, or full payment card details.
            </p>
            <p>
              Lambrk will explain how the request affects your account and any
              shared group records, including any data that needs to be
              retained and why. If you have an active store subscription,
              cancel it separately in the store to stop future renewals.
            </p>
          </section>

          <section aria-labelledby="contact">
            <h2 id="contact">Contact and privacy requests</h2>
            <p>
              For questions about this policy or to request access to,
              correction of, or deletion of your personal data, contact Lambrk
              at{" "}
              <a className={linkClass} href={`mailto:${contactEmail}`}>
                {contactEmail}
              </a>
              .
            </p>
          </section>

          <section aria-labelledby="updates">
            <h2 id="updates">Changes to this policy</h2>
            <p>
              Lambrk will publish changes on this page and update the date at
              the top.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
