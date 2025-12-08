import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CardWatermark } from "@/components/ui/card-watermark";
import { 
  Squares2X2Icon, 
  ChartBarIcon, 
  ShieldCheckIcon,
  BoltIcon,
  UserGroupIcon,
  SparklesIcon,
  ArrowTopRightOnSquareIcon
} from "@heroicons/react/24/solid";

const features = [
  {
    icon: ChartBarIcon,
    title: "Real-Time Analytics",
    description: "Track your trading performance with live data feeds directly from the Lighter exchange."
  },
  {
    icon: ShieldCheckIcon,
    title: "Wallet Tracking",
    description: "Monitor any wallet address, analyze trading patterns, and learn from successful traders."
  },
  {
    icon: BoltIcon,
    title: "Instant Insights",
    description: "Get AI-powered trading insights and pattern recognition to improve your strategies."
  },
  {
    icon: UserGroupIcon,
    title: "Community Driven",
    description: "Built by traders, for traders. Compare wallets and discover top performers."
  }
];

const stats = [
  { value: "24/7", label: "Real-time Monitoring" },
  { value: "100%", label: "Free to Use" },
  { value: "∞", label: "Wallets Trackable" },
  { value: "0", label: "API Keys Required" }
];

export default function About() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
        {/* Hero Section */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <SparklesIcon className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">Community Analytics Tool</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            About <span className="text-primary">LighterDash</span>
          </h1>
          
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            LighterDash is a community-built analytics dashboard for the{" "}
            <a 
              href="https://app.lighter.xyz" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Lighter
            </a>{" "}
            decentralized trading platform. We empower traders with real-time insights, 
            wallet tracking, and performance analytics.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 md:mb-16">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center p-4 bg-card/50 border-border/50 relative overflow-hidden">
              <CardWatermark />
              <CardContent className="p-0 relative">
                <div className="text-2xl md:text-3xl font-bold text-primary mb-1">
                  {stat.value}
                </div>
                <div className="text-[10px] md:text-xs text-muted-foreground">
                  {stat.label}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Grid */}
        <div className="mb-12 md:mb-16">
          <h2 className="text-xl md:text-2xl font-semibold text-foreground text-center mb-8">
            What We Offer
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <Card key={index} className="p-5 bg-card/50 border-border/50 hover:border-primary/30 transition-colors relative overflow-hidden">
                <CardWatermark />
                <CardContent className="p-0 flex gap-4 relative">
                  <div className="p-2.5 rounded-lg bg-primary/10 h-fit shrink-0">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* About Lighter Section */}
        <Card className="p-6 md:p-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 mb-12 md:mb-16 relative overflow-hidden">
          <CardWatermark />
          <CardContent className="p-0 relative">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/10 shrink-0">
                <Squares2X2Icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-semibold text-foreground mb-2">
                  What is Lighter?
                </h2>
                <p className="text-muted-foreground text-xs md:text-sm leading-relaxed mb-4">
                  Lighter is a decentralized trading platform built for unmatched security and scale. 
                  It's the first exchange to offer verifiable order matching and liquidations while 
                  delivering best-in-class performance on par with traditional exchanges. Built on 
                  succinct execution proofs with Ethereum as the anchoring layer.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs h-8"
                  onClick={() => window.open("https://app.lighter.xyz/?referral=LIGHTERDASH", "_blank")}
                >
                  <span>Visit Lighter</span>
                  <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support Section */}
        <div className="text-center">
          <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3">
            Support LighterDash
          </h2>
          <p className="text-muted-foreground text-xs md:text-sm max-w-lg mx-auto mb-6">
            LighterDash is free and open to all traders. If you find value in our tools, 
            consider supporting us by using our referral link when trading on Lighter.
          </p>
          <Button
            size="sm"
            className="gap-1.5 text-xs h-9"
            onClick={() => window.open("https://app.lighter.xyz/?referral=LIGHTERDASH", "_blank")}
          >
            <SparklesIcon className="w-3.5 h-3.5" />
            <span>Trade with Our Referral</span>
            <ArrowTopRightOnSquareIcon className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </Layout>
  );
}
