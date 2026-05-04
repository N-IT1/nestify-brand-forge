import { Card } from "@/components/ui/card";

export function FounderLetter() {
  return (
    <section id="letter" className="py-24 bg-background relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-4">
            A Personal Note
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            Your Growth is{" "}
            <span className="text-gradient">Our Mission</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            A direct message to our partners — the retailers of Trunt.
          </p>
        </div>

        <Card className="max-w-3xl mx-auto bg-card/60 backdrop-blur-sm border-border/60 rounded-3xl p-10 md:p-14 shadow-card">
          <article className="prose-trunt space-y-6 text-foreground/90 leading-relaxed">
            <p className="text-lg font-medium text-foreground">Dear Business Owner,</p>

            <p>
              Moving your business online shouldn't be expensive or complicated. Trunt Commerce
              exists to remove the barriers between you and your customers. Our mission is to
              replace the <span className="italic text-foreground">"DM for price"</span> struggle
              with a professional, automated storefront that you fully own.
            </p>

            <div className="pt-2">
              <p className="font-display font-semibold text-foreground mb-4">
                Our Commitment to You
              </p>
              <ul className="space-y-4 list-none pl-0">
                <li className="flex gap-4">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  <span>
                    <span className="font-semibold text-foreground">Total Ownership.</span>{" "}
                    You control your store, your data, and your brand. We provide the tools;
                    you keep the power.
                  </span>
                </li>
                <li className="flex gap-4">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  <span>
                    <span className="font-semibold text-foreground">Security & Trust.</span>{" "}
                    We enforce a zero-tolerance policy against fraud. Your business documents
                    are private and will never be shared with third parties.
                  </span>
                </li>
                <li className="flex gap-4">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  <span>
                    <span className="font-semibold text-foreground">Affordability.</span>{" "}
                    We've kept our pricing intentionally low so even the smallest startup can
                    afford a world-class website.
                  </span>
                </li>
              </ul>
            </div>

            <p>
              We aren't just a service provider — we are your partner. We succeed only when
              your business grows.
            </p>

            <p className="font-display text-foreground text-lg">
              Launch with confidence. Build with Trunt.
            </p>

            <div className="pt-6 border-t border-border/60">
              <p className="font-display font-semibold text-foreground">The Trunt Team</p>
              <a
                href="https://www.trunt.online"
                className="text-sm text-primary hover:underline"
              >
                www.trunt.online
              </a>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mt-2">
                Your Trusted Online Commerce Partner
              </p>
            </div>
          </article>
        </Card>
      </div>
    </section>
  );
}
