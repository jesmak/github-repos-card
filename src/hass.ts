/** The little of Home Assistant a card needs, so the unmaintained custom-card-helpers isn't a dependency. */

export interface HassEntity {
    entity_id: string;
    state: string;
    last_changed: string;
    attributes: Record<string, unknown>;
}

/** An entity's registry entry as the frontend has it: enough to find a sensor by its device and its key. */
export interface HassEntityEntry {
    entity_id: string;
    device_id?: string | null;
    platform?: string;
    translation_key?: string | null;
}

export interface HassDevice {
    id: string;
    name?: string | null;
}

export interface HomeAssistant {
    states: Record<string, HassEntity | undefined>;
    entities?: Record<string, HassEntityEntry | undefined>;
    devices?: Record<string, HassDevice | undefined>;
    language?: string;
    locale?: { language?: string };
}

export interface LovelaceCardConfig {
    type: string;
    [key: string]: unknown;
}
