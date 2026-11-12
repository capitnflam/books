import type { FC, ReactNode } from 'react';

type PageSectionProps = {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
};

/** A section of a page, titled like a form legend: heading-3 over a rule. */
const PageSection: FC<PageSectionProps> = ({ id, title, description, children }) => (
  <section aria-labelledby={id} className="flex flex-col gap-4">
    <div className="flex flex-col gap-2.5">
      <h2 id={id} className="text-heading-3 border-rule border-b pb-1.5">
        {title}
      </h2>
      {description && <p className="text-muted-foreground text-base/6">{description}</p>}
    </div>
    {children}
  </section>
);

export default PageSection;
