from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
import pandas as pd

CENTRES = [1, 2, 3, 4, 5]
CROPS = ["Wheat", "Rice", "Mustard", "Cotton", "Maize"]


def generate_sample_data(rows: int = 1500, seed: int = 42) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    dates = pd.date_range("2025-01-01", periods=365, freq="D")
    date_values = rng.choice(dates, size=rows)
    hours = rng.choice(np.arange(8, 18), size=rows, p=[0.04, 0.08, 0.12, 0.14, 0.15, 0.14, 0.12, 0.11, 0.07, 0.03])
    centre_ids = rng.choice(CENTRES, size=rows)
    crops = rng.choice(CROPS, size=rows)
    current_queue = rng.integers(0, 90, size=rows)
    active_counters = rng.integers(1, 7, size=rows)
    farmers_arrived = current_queue + rng.integers(0, 45, size=rows)
    farmers_processed = rng.integers(0, 75, size=rows)
    average_processing = np.round(rng.uniform(7, 24, size=rows), 1)
    quantity = np.round(rng.uniform(1, 35, size=rows), 1)
    booked_farmers = current_queue + rng.integers(0, 65, size=rows)

    weekday = pd.Series(date_values).dt.dayofweek.to_numpy()
    peak_penalty = np.where(np.isin(hours, [9, 10, 11, 12]), 8, 0)
    centre_penalty = np.array([centre_id * 1.8 for centre_id in centre_ids])
    crop_penalty = np.select(
        [crops == "Rice", crops == "Cotton", crops == "Mustard"],
        [4.0, 3.0, 1.5],
        default=0.0,
    )
    noise = rng.normal(0, 3, size=rows)
    actual_waiting = (
        8
        + current_queue * 0.48
        + booked_farmers * 0.18
        + farmers_arrived * 0.08
        - farmers_processed * 0.12
        - active_counters * 3.2
        + average_processing * 0.85
        + quantity * 0.12
        + peak_penalty
        + centre_penalty
        + crop_penalty
        + np.where(weekday >= 5, 3, 0)
        + noise
    ).clip(3, None)

    return pd.DataFrame(
        {
            "Date": pd.to_datetime(date_values).strftime("%Y-%m-%d"),
            "Centre ID": centre_ids,
            "Time": [f"{hour:02d}:00" for hour in hours],
            "Current Queue": current_queue,
            "Active Counters": active_counters,
            "Farmers Arrived": farmers_arrived,
            "Farmers Processed": farmers_processed,
            "Average Processing Time": average_processing,
            "Crop": crops,
            "Quantity": quantity,
            "Booked Farmers": booked_farmers,
            "Actual Waiting Time": np.round(actual_waiting, 1),
        }
    )


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate sample procurement waiting-time data.")
    parser.add_argument("--rows", type=int, default=1500)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--output", type=Path, default=Path(__file__).parent / "data" / "procurement_sample.csv")
    args = parser.parse_args()
    if args.rows < 100:
        parser.error("--rows must be at least 100")
    args.output.parent.mkdir(parents=True, exist_ok=True)
    frame = generate_sample_data(args.rows, args.seed)
    frame.to_csv(args.output, index=False)
    print(f"Generated {len(frame)} rows at {args.output}")


if __name__ == "__main__":
    main()
