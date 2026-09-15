from __future__ import annotations

import argparse
import json
from pathlib import Path

import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

from generate_data import generate_sample_data

TARGET = "Actual Waiting Time"
CATEGORICAL_FEATURES = ["Centre ID", "Crop", "Hour", "Day of Week", "Month"]
NUMERIC_FEATURES = [
    "Current Queue",
    "Active Counters",
    "Farmers Arrived",
    "Farmers Processed",
    "Average Processing Time",
    "Quantity",
    "Booked Farmers",
]


def prepare_features(frame: pd.DataFrame) -> pd.DataFrame:
    prepared = frame.copy()
    dates = pd.to_datetime(prepared.pop("Date"))
    times = pd.to_datetime(prepared.pop("Time"), format="%H:%M")
    prepared["Hour"] = times.dt.hour.astype(str)
    prepared["Day of Week"] = dates.dt.dayofweek.astype(str)
    prepared["Month"] = dates.dt.month.astype(str)
    prepared["Centre ID"] = prepared["Centre ID"].astype(str)
    prepared["Crop"] = prepared["Crop"].astype(str)
    return prepared


def build_pipeline(seed: int = 42) -> Pipeline:
    preprocessor = ColumnTransformer(
        transformers=[
            ("categorical", OneHotEncoder(handle_unknown="ignore"), CATEGORICAL_FEATURES),
            ("numeric", "passthrough", NUMERIC_FEATURES),
        ]
    )
    model = RandomForestRegressor(
        n_estimators=300,
        max_depth=18,
        min_samples_leaf=2,
        random_state=seed,
        n_jobs=-1,
    )
    return Pipeline([("preprocessor", preprocessor), ("model", model)])


def train(data_path: Path, model_path: Path, metrics_path: Path, seed: int = 42) -> dict:
    if data_path.exists():
        frame = pd.read_csv(data_path)
    else:
        frame = generate_sample_data(seed=seed)
        data_path.parent.mkdir(parents=True, exist_ok=True)
        frame.to_csv(data_path, index=False)

    missing = set([*CATEGORICAL_FEATURES, *NUMERIC_FEATURES, TARGET, "Date", "Time"]) - set(frame.columns) - {"Hour", "Day of Week", "Month"}
    if missing:
        raise ValueError(f"Missing required columns: {sorted(missing)}")

    features = prepare_features(frame.drop(columns=[TARGET]))
    target = frame[TARGET]
    x_train, x_test, y_train, y_test = train_test_split(features, target, test_size=0.2, random_state=seed)
    pipeline = build_pipeline(seed)
    pipeline.fit(x_train, y_train)
    predictions = pipeline.predict(x_test)
    metrics = {
        "rows": len(frame),
        "mean_absolute_error_minutes": round(float(mean_absolute_error(y_test, predictions)), 3),
        "r2_score": round(float(r2_score(y_test, predictions)), 3),
        "features": ["Date", "Centre ID", "Time", *NUMERIC_FEATURES[0:7], "Crop"],
    }
    model_path.parent.mkdir(parents=True, exist_ok=True)
    metrics_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(pipeline, model_path)
    metrics_path.write_text(json.dumps(metrics, indent=2), encoding="utf-8")
    return metrics


def main() -> None:
    parser = argparse.ArgumentParser(description="Train the procurement waiting-time Random Forest model.")
    root = Path(__file__).parent
    parser.add_argument("--data", type=Path, default=root / "data" / "procurement_sample.csv")
    parser.add_argument("--model", type=Path, default=root / "artifacts" / "waiting_time_random_forest.joblib")
    parser.add_argument("--metrics", type=Path, default=root / "artifacts" / "metrics.json")
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()
    metrics = train(args.data, args.model, args.metrics, args.seed)
    print(json.dumps(metrics, indent=2))


if __name__ == "__main__":
    main()
