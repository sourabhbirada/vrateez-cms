"use client";

import { Plus, X } from "lucide-react";

export type CustomizationChoice = {
  label: string;
  value: string;
  image: string;
  priceDelta: number;
};

export type CustomizationOption = {
  key: string;
  label: string;
  type: "select" | "text";
  required: boolean;
  choices: CustomizationChoice[];
};

export type ProductCustomization = {
  enabled: boolean;
  title: string;
  options: CustomizationOption[];
};

type Props = {
  value: ProductCustomization;
  onChange: (next: ProductCustomization) => void;
};

export function emptyCustomization(): ProductCustomization {
  return {
    enabled: false,
    title: "Choose your Rakhi",
    options: [],
  };
}

export default function ProductCustomizationEditor({ value, onChange }: Props) {
  const addOption = () => {
    onChange({
      ...value,
      options: [
        ...value.options,
        {
          key: `option_${value.options.length + 1}`,
          label: "Rakhi style",
          type: "select",
          required: true,
          choices: [
            { label: "Traditional", value: "traditional", image: "", priceDelta: 0 },
            { label: "Designer", value: "designer", image: "", priceDelta: 0 },
          ],
        },
      ],
    });
  };

  const updateOption = (index: number, patch: Partial<CustomizationOption>) => {
    onChange({
      ...value,
      options: value.options.map((opt, i) => (i === index ? { ...opt, ...patch } : opt)),
    });
  };

  const removeOption = (index: number) => {
    onChange({
      ...value,
      options: value.options.filter((_, i) => i !== index),
    });
  };

  const addChoice = (optionIndex: number) => {
    const options = value.options.map((opt, i) =>
      i === optionIndex
        ? {
            ...opt,
            choices: [...opt.choices, { label: "", value: "", image: "", priceDelta: 0 }],
          }
        : opt
    );
    onChange({ ...value, options });
  };

  const updateChoice = (
    optionIndex: number,
    choiceIndex: number,
    field: keyof CustomizationChoice,
    fieldValue: string | number
  ) => {
    const options = value.options.map((opt, i) => {
      if (i !== optionIndex) return opt;
      return {
        ...opt,
        choices: opt.choices.map((choice, j) =>
          j === choiceIndex ? { ...choice, [field]: fieldValue } : choice
        ),
      };
    });
    onChange({ ...value, options });
  };

  const removeChoice = (optionIndex: number, choiceIndex: number) => {
    const options = value.options.map((opt, i) =>
      i === optionIndex
        ? { ...opt, choices: opt.choices.filter((_, j) => j !== choiceIndex) }
        : opt
    );
    onChange({ ...value, options });
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-stone-900">Product customization</h2>
          <p className="text-xs text-muted mt-0.5">
            Let shoppers pick Rakhi style, message, color, etc. on the product page.
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm text-stone-700 cursor-pointer">
          <input
            type="checkbox"
            checked={value.enabled}
            onChange={(e) => onChange({ ...value, enabled: e.target.checked })}
            className="rounded border-border"
          />
          Enabled
        </label>
      </div>

      {value.enabled && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Section title</label>
            <input
              type="text"
              value={value.title}
              onChange={(e) => onChange({ ...value, title: e.target.value })}
              placeholder="Choose your Rakhi"
              className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {value.options.map((option, optionIndex) => (
            <div key={optionIndex} className="rounded-xl border border-border p-4 space-y-3 bg-surface/40">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-stone-800">Option {optionIndex + 1}</p>
                <button
                  type="button"
                  onClick={() => removeOption(optionIndex)}
                  className="p-1.5 text-muted hover:text-danger"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={option.label}
                  onChange={(e) => updateOption(optionIndex, { label: e.target.value })}
                  placeholder="Label"
                  className="px-3 py-2 border border-border rounded-lg text-sm"
                />
                <input
                  type="text"
                  value={option.key}
                  onChange={(e) =>
                    updateOption(optionIndex, {
                      key: e.target.value.toLowerCase().replace(/\s+/g, "_"),
                    })
                  }
                  placeholder="key"
                  className="px-3 py-2 border border-border rounded-lg text-sm font-mono"
                />
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={option.type}
                  onChange={(e) =>
                    updateOption(optionIndex, { type: e.target.value as "select" | "text" })
                  }
                  className="px-3 py-2 border border-border rounded-lg text-sm"
                >
                  <option value="select">Select / choices</option>
                  <option value="text">Text input</option>
                </select>
                <label className="flex items-center gap-2 text-xs text-stone-600">
                  <input
                    type="checkbox"
                    checked={option.required}
                    onChange={(e) => updateOption(optionIndex, { required: e.target.checked })}
                  />
                  Required
                </label>
              </div>

              {option.type === "select" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-stone-600">Choices</p>
                    <button
                      type="button"
                      onClick={() => addChoice(optionIndex)}
                      className="flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <Plus size={12} /> Add choice
                    </button>
                  </div>
                  {option.choices.map((choice, choiceIndex) => (
                    <div
                      key={choiceIndex}
                      className="grid grid-cols-[1fr_1fr_80px_auto] gap-2 items-center"
                    >
                      <input
                        type="text"
                        value={choice.label}
                        onChange={(e) =>
                          updateChoice(optionIndex, choiceIndex, "label", e.target.value)
                        }
                        placeholder="Label"
                        className="px-2 py-1.5 border border-border rounded-lg text-xs"
                      />
                      <input
                        type="text"
                        value={choice.value}
                        onChange={(e) =>
                          updateChoice(
                            optionIndex,
                            choiceIndex,
                            "value",
                            e.target.value.toLowerCase().replace(/\s+/g, "-")
                          )
                        }
                        placeholder="value"
                        className="px-2 py-1.5 border border-border rounded-lg text-xs font-mono"
                      />
                      <input
                        type="number"
                        value={choice.priceDelta}
                        onChange={(e) =>
                          updateChoice(optionIndex, choiceIndex, "priceDelta", Number(e.target.value))
                        }
                        placeholder="+₹"
                        className="px-2 py-1.5 border border-border rounded-lg text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => removeChoice(optionIndex, choiceIndex)}
                        className="p-1 text-muted hover:text-danger"
                      >
                        <X size={14} />
                      </button>
                      <input
                        type="text"
                        value={choice.image}
                        onChange={(e) =>
                          updateChoice(optionIndex, choiceIndex, "image", e.target.value)
                        }
                        placeholder="Image URL (optional)"
                        className="col-span-4 px-2 py-1.5 border border-border rounded-lg text-xs"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addOption}
            className="flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <Plus size={15} /> Add customization option
          </button>
        </div>
      )}
    </div>
  );
}
