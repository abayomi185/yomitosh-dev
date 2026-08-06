import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import socialLinks from "@json/social-links.json";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const SocialLinks = () => {
  return (
    <ul className="flex justify-center gap-1 py-6">
      {socialLinks.map((link) => (
        <li key={link.icon}>
          <Button asChild variant="ghost" size="icon">
            <Link
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.icon}
            >
              <FontAwesomeIcon
                icon={[link.icon_group, link.icon] as IconProp}
                size="lg"
              />
            </Link>
          </Button>
        </li>
      ))}
    </ul>
  );
};

export default SocialLinks;
