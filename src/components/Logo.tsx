export function Logo({ size = 'normal' }: { size?: 'small' | 'normal' | 'large' }) {
  const sizes = {
    small: {
      container: 'gap-2',
      icon: 'text-3xl',
      text: 'text-xl',
      tagline: 'text-xs'
    },
    normal: {
      container: 'gap-3',
      icon: 'text-5xl',
      text: 'text-4xl',
      tagline: 'text-sm'
    },
    large: {
      container: 'gap-4',
      icon: 'text-6xl',
      text: 'text-5xl',
      tagline: 'text-base'
    }
  };

  const s = sizes[size];

  return (
    <div className={`flex items-center ${s.container}`}>
      <span className={`${s.icon} filter drop-shadow-md`}>🍺</span>
      <div>
        <h1 className={`${s.text} font-display font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 bg-clip-text text-transparent leading-none`}>
          Tácek
        </h1>
        <p className={`${s.tagline} text-gray-600 font-medium italic`}>
          Kde přátelství končí a dluhy začínají
        </p>
      </div>
    </div>
  );
}
