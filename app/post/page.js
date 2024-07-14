import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function Component() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <header className="bg-muted py-12 md:py-20">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold md:text-5xl">
              The Rise of Generative AI: Shaping the Future of Content Creation
            </h1>
            <div className="flex items-center space-x-4 text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder-user.jpg" />
                  <AvatarFallback>AC</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">John Doe</span>
              </div>
              <span className="text-sm">Published on July 14, 2024</span>
            </div>
          </div>
        </div>
      </header>
      <main className="container max-w-6xl mx-auto py-12 md:py-20 px-4 grid grid-cols-1 md:grid-cols-[3fr_1fr] gap-8">
        <article className="prose prose-gray dark:prose-invert">
          <p>
            In the ever-evolving landscape of content creation, a new era has
            dawned – the rise of generative AI. This transformative technology
            is poised to reshape the way we approach and consume content,
            ushering in a new era of unprecedented creativity and efficiency.
          </p>
          <p>
            Generative AI, a subfield of artificial intelligence, is a powerful
            tool that can generate human-like text, images, and even audio. By
            leveraging advanced language models and deep learning algorithms,
            these AI systems can create content that is indistinguishable from
            that produced by humans.
          </p>
          <p>
            One of the most significant impacts of generative AI on the content
            creation industry is the ability to streamline and accelerate the
            creative process. Writers, designers, and multimedia artists can now
            leverage these AI-powered tools to generate initial drafts, ideate
            concepts, and even produce high-quality visuals with remarkable
            speed and efficiency.
          </p>
          <p>
            Moreover, generative AI can also be used to personalize and
            customize content for specific audiences. By analyzing user
            preferences, behavior, and contextual data, these AI systems can
            generate tailored content that resonates more effectively with
            individual readers or viewers.
          </p>
          <p>
            However, the rise of generative AI also raises important ethical and
            legal considerations. Questions around intellectual property rights,
            authenticity, and the potential for misuse or misinformation must be
            carefully addressed by industry stakeholders, policymakers, and the
            public.
          </p>
          <p>
            As we navigate this new frontier of content creation, it is crucial
            that we strike a balance between embracing the transformative
            potential of generative AI and upholding the principles of
            transparency, accountability, and responsible innovation. Only then
            can we truly harness the power of this technology to shape a future
            where creativity, storytelling, and knowledge-sharing thrive in
            unprecedented ways.
          </p>
        </article>
        <div className="space-y-4">
          <Card className="w-full">
            <CardHeader>
              <Avatar className="h-16 w-16">
                <AvatarImage src="/placeholder-user.jpg" />
                <AvatarFallback>AC</AvatarFallback>
              </Avatar>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <h3 className="text-lg font-medium">John Doe</h3>
                <p className="text-muted-foreground">
                  Content Creator, AI Enthusiast
                </p>
              </div>
              <p className="text-muted-foreground">
                John is a passionate content creator and AI enthusiast who
                explores the intersection of technology and storytelling. He is
                excited about the transformative potential of generative AI and
                its impact on the future of content creation.
              </p>
              <div className="flex items-center space-x-4">
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground"
                  prefetch={false}
                >
                  <TwitterIcon className="h-5 w-5" />
                </Link>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground"
                  prefetch={false}
                >
                  <LinkedinIcon className="h-5 w-5" />
                </Link>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground"
                  prefetch={false}
                >
                  <GitlabIcon className="h-5 w-5" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}


function GitlabIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m22 13.29-3.33-10a.42.42 0 0 0-.14-.18.38.38 0 0 0-.22-.11.39.39 0 0 0-.23.07.42.42 0 0 0-.14.18l-2.26 6.67H8.32L6.1 3.26a.42.42 0 0 0-.1-.18.38.38 0 0 0-.26-.08.39.39 0 0 0-.23.07.42.42 0 0 0-.14.18L2 13.29a.74.74 0 0 0 .27.83L12 21l9.69-6.88a.71.71 0 0 0 .31-.83Z" />
    </svg>
  )
}


function LinkedinIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}


function TwitterIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  )
}


function XIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}