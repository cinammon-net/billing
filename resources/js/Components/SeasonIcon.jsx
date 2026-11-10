import {
    BookOpen, Crown, Egg, Flame, Flower2, Gamepad2, Ghost, Heart, Leaf, PartyPopper, Rocket, ShoppingCart, Skull, Snowflake, Sun, TreePine,
} from 'lucide-react';

/** Icono de línea para una estación o festivo (en vez de emojis). `k` = clave de Seasons.php. */
const ICONS = {
    winter: Snowflake, spring: Flower2, summer: Sun, autumn: Leaf,
    new_year: PartyPopper, reyes: Crown, valentine: Heart, carnival: PartyPopper, easter: Egg, book_day: BookOpen,
    star_wars: Rocket, san_juan: Flame, gamer_day: Gamepad2, halloween: Ghost, muertos: Skull, thanksgiving: Leaf,
    black_friday: ShoppingCart, christmas: TreePine,
};

export default function SeasonIcon({ k, className = 'h-3.5 w-3.5' }) {
    const Icon = ICONS[k] || Leaf;
    return <Icon className={`inline-block -translate-y-px ${className}`} aria-hidden="true" />;
}
