from __future__ import annotations

import argparse
from datetime import date
from pathlib import Path

import joblib
import pandas as pd

from train_model import prepare_features


def predict_best_centre(
    model_path: Path,
    data_path: Path,
    prediction_date: str,
    time: str,
    crop: str,
    quantity: float,
    booked_farmers: int,
    current_queue: int,
    active_counters: int,
    farmers_arrived: int,
    farmers_processed: int,
    average_processing_time: float,
) -> pd.DataFrame:
    model = joblib.load(model_path)
    centre_ids = sorted(pd.read_csv(data_path)["Centre ID"].unique())
    candidates = pd.DataFrame(
        {
            "Date": prediction_date,
            "Centre ID": centre_ids,
            "Time": time,
            "Current Queue": current_queue,
            "Active Counters": active_counters,
            "Farmers Arrived": farmers_arrived,
            "Farmers Processed": farmers_processed,
            "Average Processing Time": average_processing_time,
            "Crop": crop,
            "Quantity": quantity,
            "Booked Farmers": booked_farmers,
        }
    )
    candidates["Predicted Waiting Time"] = model.predict(prepare_features(candidates))
    return candidates.sort_values("Predicted Waiting Time").reset_index(drop=True)


def main() -> None:
    root = Path(__file__).parent
    parser = argparse.ArgumentParser(description="Predict the best procurement centre by estimated waiting time.")
    parser.add_argument("--date", default=str(date.today()), help="Visit date in YYYY-MM-DD format")
    parser.add_argument("--time", default="10:00", help="Arrival time in HH:MM format")
    parser.add_argument("--crop", default="Wheat", choices=["Wheat", "Rice", "Mustard", "Cotton", "Maize"])
    parser.add_argument("--quantity", type=float, default=10.0)
    parser.add_argument("--booked-farmers", type=int, default=20)
    parser.add_argument("--current-queue", type=int, default=15)
    parser.add_argument("--active-counters", type=int, default=3)
    parser.add_argument("--farmers-arrived", type=int, default=30)
    parser.add_argument("--farmers-processed", type=int, default=18)
    parser.add_argument("--average-processing-time", type=float, default=14.0)
    parser.add_argument("--model", type=Path, default=root / "artifacts" / "waiting_time_random_forest.joblib")
    parser.add_argument("--data", type=Path, default=root / "data" / "procurement_sample.csv")
    args = parser.parse_args()

    if not args.model.exists():
        raise SystemExit("Model not found. Run: python train_model.py")
    results = predict_best_centre(
        args.model, args.data, args.date, args.time, args.crop, args.quantity,
        args.booked_farmers, args.current_queue, args.active_counters,
        args.farmers_arrived, args.farmers_processed, args.average_processing_time,
    )
    best = results.iloc[0]
    print(f"Best procurement centre: Centre {int(best['Centre ID'])}")
    print(f"Predicted waiting time: {best['Predicted Waiting Time']:.1f} minutes")
    print("\nCentre ranking:")
    print(results[["Centre ID", "Predicted Waiting Time"]].to_string(index=False, formatters={"Predicted Waiting Time": "{:.1f}".format}))


if __name__ == "__main__":
    main()
