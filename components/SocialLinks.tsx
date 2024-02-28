import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import socialLinks from "@json/social-links.json";
import Link from "next/link";

const SocialLinks = () => {
  return (
    <ul className="py-6">
      {socialLinks.map((link) => (
        <li className="mr-3 inline" key={link.icon}>
          <Link
            className="text-gray-700  hover:text-custom-1"
            href={link.url}
            target="_blank"
            rel="noopener"
          >
            <span>
              <FontAwesomeIcon
                icon={[link.icon_group, link.icon] as IconProp}
                size="2x"
              />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default SocialLinks;
