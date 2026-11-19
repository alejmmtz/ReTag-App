import type { FormEvent } from 'react';
import type { StoreErrors, StoreFields } from './store-fields';

type Props = {
  fields: StoreFields;
  errors: StoreErrors;
  onChange: (field: keyof StoreFields, value: string) => void;
  onContinue: (event: FormEvent<HTMLFormElement>) => void;
};

const inputs = [
  { name: 'storeName', label: 'Store name', placeholder: "Your store's name", max: 40, autoComplete: 'organization' },
  { name: 'location', label: 'Location', placeholder: 'Street, neighborhood, city', max: 255, autoComplete: 'street-address' },
  { name: 'socialmedia', label: 'Social media', placeholder: '@your_store', max: 21, autoComplete: 'off' },
  { name: 'schedule', label: 'Schedule', placeholder: 'Mon-Sat · 11:00 AM-8:30 PM', max: 100, autoComplete: 'off' },
] as const;

export default function StoreInformation({ fields, errors, onChange, onContinue }: Props) {
  return (
    <form id="store-information" noValidate onSubmit={onContinue} className="space-y-5">
      {inputs.map((input) => (
        <div key={input.name}>
          <label htmlFor={`store-${input.name}`} className="mb-2 block text-xs text-grey">
            {input.label}{input.name !== 'storeName' && <span className="ml-1 text-grey/70">· optional</span>}
          </label>
          <input
            id={`store-${input.name}`}
            name={input.name}
            required={input.name === 'storeName'}
            autoComplete={input.autoComplete}
            maxLength={input.max}
            value={fields[input.name]}
            placeholder={input.placeholder}
            onChange={(event) => onChange(input.name, event.target.value)}
            aria-invalid={!!errors[input.name]}
            aria-describedby={errors[input.name] ? `store-${input.name}-error` : undefined}
            className="min-h-12 w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-foreground outline-none placeholder:text-grey/70 focus:border-blue aria-invalid:border-orange"
          />
          {errors[input.name] && <p id={`store-${input.name}-error`} className="mt-2 text-xs text-orange">{errors[input.name]}</p>}
        </div>
      ))}
      <div>
        <label htmlFor="store-description" className="mb-2 block text-xs text-grey">Description <span className="text-grey/70">· optional</span></label>
        <textarea
          id="store-description"
          name="description"
          rows={4}
          maxLength={350}
          value={fields.description}
          onChange={(event) => onChange('description', event.target.value)}
          placeholder="What makes your finds special? Tell the community."
          aria-invalid={!!errors.description}
          aria-describedby="store-description-count"
          className="w-full resize-none rounded-2xl border border-line bg-surface px-4 py-3 text-sm outline-none placeholder:text-grey/70 focus:border-blue aria-invalid:border-orange"
        />
        <p id="store-description-count" className="mt-1 text-right text-xs tabular-nums text-grey">{fields.description.length}/350</p>
        {errors.description && <p className="mt-2 text-xs text-orange">{errors.description}</p>}
      </div>
    </form>
  );
}
