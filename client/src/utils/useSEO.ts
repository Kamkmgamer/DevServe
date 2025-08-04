import { useEffect } from "react";

type MetaTag = {
  name?: string;
  property?: string;
  content: string;
};

export function useSEO(title?: string, metas: MetaTag[] = []) {
  useEffect(() => {
    const prevTitle = document.title;
    if (title) document.title = title;

    const created: HTMLMetaElement[] = [];

    metas.forEach((m) => {
      const selector = m.name
        ? `meta[name="${m.name}"]`
        : m.property
        ? `meta[property="${m.property}"]`
        : null;

      let el: HTMLMetaElement | null = selector
        ? (document.head.querySelector(selector) as HTMLMetaElement | null)
        : null;

      if (!el) {
        el = document.createElement("meta");
        if (m.name) el.setAttribute("name", m.name);
        if (m.property) el.setAttribute("property", m.property);
        document.head.appendChild(el);
        created.push(el);
      }
      el.setAttribute("content", m.content);
    });

    return () => {
      if (title) document.title = prevTitle;
      created.forEach((el) => el.remove());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, JSON.stringify(metas)]);
}