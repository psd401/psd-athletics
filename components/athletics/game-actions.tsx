import { formatShortDate } from "../../lib/schedule/time";
import { opponentLine, type GameView } from "../../lib/schedule/games";
import styles from "./game-actions.module.css";
import { CalendarAddIcon, PinIcon, TicketIcon, WatchIcon } from "./icons";

export function mapsUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

interface GameActionsProps {
  game: GameView;
  /** "Directions" on the hub, "Map" on compact cards. */
  directionsLabel?: string;
  className?: string;
}

/**
 * Per-game actions (SPEC §4). Tickets, Watch and Directions appear only when
 * the game has the link or a known venue; nothing is guessed (DECISIONS 15).
 */
export function GameActions({ game, directionsLabel = "Directions", className }: GameActionsProps) {
  const what = `${game.sport} ${opponentLine(game)}, ${formatShortDate(game.startDate)}`;
  return (
    <div className={[styles.actions, className].filter(Boolean).join(" ")}>
      {game.ticketUrl ? (
        <a className={`${styles.act} ${styles.strong}`} href={game.ticketUrl} aria-label={`Buy tickets: ${what}`}>
          <TicketIcon />
          Tickets
        </a>
      ) : null}
      {game.streamUrl ? (
        <a className={styles.act} href={game.streamUrl} aria-label={`Watch on NFHS Network: ${what}`}>
          <WatchIcon />
          Watch
        </a>
      ) : null}
      {game.venueAddress ? (
        <a className={styles.act} href={mapsUrl(game.venueAddress)} aria-label={`${directionsLabel} to ${game.venueName ?? "the venue"}: ${what}`}>
          <PinIcon />
          {directionsLabel}
        </a>
      ) : null}
      <a
        className={`${styles.act} ${styles.iconOnly}`}
        href={`/api/games/${game.id}/ics`}
        aria-label={`Add to calendar: ${what}`}
        title="Add to calendar"
      >
        <CalendarAddIcon />
      </a>
    </div>
  );
}
