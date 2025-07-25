import React from "react";

const RenderBlock = ({ block }) => {
  if (!block) return null;
  switch (block.type) {
    case "heading":
      const HeadingTag = `h${block.level}`;
      return (
        <HeadingTag className="letter-1 text-btn-uppercase mb_12">
          {block.children[0]?.text || ""}
        </HeadingTag>
      );
    case "paragraph":
      return (
        <p className="mb_12 text-secondary">{block.children[0]?.text || ""}</p>
      );
    case "list":
      if (block.format === "unordered") {
        return (
          <ul className="list-text type-disc mb_12 gap-6">
            {block.children.map((item, idx) => (
              <li key={idx} className="font-2">
                {item.children[0]?.text || ""}
              </li>
            ))}
          </ul>
        );
      }
      return (
        <ol className="mb_12">
          {block.children.map((item, idx) => (
            <li key={idx}>{item.children[0]?.text || ""}</li>
          ))}
        </ol>
      );
    default:
      return null;
  }
};

export default function ReturnPolicies({ return_policies }) {
  if (!return_policies || !Array.isArray(return_policies) || return_policies.length === 0) {
    return <div>No return policy information available.</div>;
  }
  return (
    <div>
      {return_policies.map((block, idx) => (
        <RenderBlock key={idx} block={block} />
      ))}
    </div>
  );
}
