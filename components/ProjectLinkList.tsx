import links from "@json/links_projects.json";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const LinkList = () => {
  return (
    <section className="flex px-3 sm:px-0 pb-12">
      <ul className="w-full md:w-4/5 lg:w-3/6 mx-auto">
        {links.map((link) => (
          <li className="mb-4" key={link.title}>
            {link.active && (
              <Button
                asChild
                variant="secondary"
                className="relative h-auto w-full rounded-xl border py-4 text-center text-base font-bold shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-accent hover:text-accent-foreground"
              >
                <Link href={link.url} target="_blank" rel="noopener noreferrer">
                  <span className="absolute inset-y-0 left-0 flex w-12 items-center justify-center text-3xl [&_svg]:!size-[1.875rem]">
                    {link.emoji}
                  </span>
                  <span className="break-words text-wrap ml-8 leading-tight">
                    {link.title}
                  </span>
                </Link>
              </Button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default LinkList;
