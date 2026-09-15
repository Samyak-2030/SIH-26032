# Procurement Centre Random Forest Prototype

This folder is independent of `frontend` and `backend`. It trains a Random Forest regressor to predict `Actual Waiting Time` and ranks procurement centres by the lowest predicted wait.

## Dataset fields

- `Date`
- `Centre ID`
- `Time`
- `Current Queue`
- `Active Counters`
- `Farmers Arrived`
- `Farmers Processed`
- `Average Processing Time`
- `Crop`
- `Quantity`
- `Booked Farmers`
- `Actual Waiting Time` (target)

## Run

From this folder:

```bash
python generate_data.py --rows 1500
python train_model.py
python predict_best_centre.py \
  --date 2026-09-20 \
  --time 10:00 \
  --crop Wheat \
  --quantity 12 \
  --booked-farmers 25 \
  --current-queue 18 \
  --active-counters 4 \
  --farmers-arrived 35 \
  --farmers-processed 20 \
  --average-processing-time 14
```

The prediction command evaluates every centre in the generated sample data and prints the centre with the lowest predicted waiting time. The trained pipeline and metrics are stored in `artifacts/`.


