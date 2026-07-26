"use client";

import { ArrowRight, Sparkles, X } from "lucide-react";
import { useEffect, useRef } from "react";

export function GuideDialog({ onClose }: { onClose: () => void }) {
  const dialogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const focusableSelector =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusable = () =>
      Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ??
          [],
      );

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === "Tab") {
        const elements = focusable();
        const first = elements[0];
        const last = elements[elements.length - 1];
        if (!first || !last) return;

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    focusable()[0]?.focus();
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
      previousFocus?.focus();
    };
  }, [onClose]);

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        ref={dialogRef}
        className="guide-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="guide-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="dialog-close" onClick={onClose} aria-label="Close">
          <X size={19} />
        </button>
        <span className="dialog-kicker">
          <Sparkles size={15} />
          Simulation notes
        </span>
        <h2 id="guide-title">Four inputs. One evolving signal.</h2>
        <p>
          FormForge blends training demand, nutrition support, and consistency
          into an interactive visual. Increase a variable and the model responds
          in real time—but each input has diminishing returns.
        </p>
        <div className="guide-grid">
          <article>
            <span>01</span>
            <h3>Build the signal</h3>
            <p>Volume and intensity work together to create training demand.</p>
          </article>
          <article>
            <span>02</span>
            <h3>Support recovery</h3>
            <p>Protein supports the signal, while extreme load adds recovery cost.</p>
          </article>
          <article>
            <span>03</span>
            <h3>Let time compound</h3>
            <p>Weeks grow the result gradually rather than producing an instant leap.</p>
          </article>
        </div>
        <p className="guide-disclaimer">
          This is an illustrative learning tool, not a forecast of body changes
          or medical guidance. Real outcomes vary by person, program, sleep,
          nutrition, and many other factors.
        </p>
        <button className="dialog-action" onClick={onClose}>
          Start exploring
          <ArrowRight size={16} />
        </button>
      </section>
    </div>
  );
}
