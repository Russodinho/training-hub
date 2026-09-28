-- How /log records a workout day:
--   'sets'   one row per set with weight / reps / RPE (the default)
--   'simple' one weight + a done checkbox per exercise, for circuits where
--            logging every set is overkill (KB Circuit)
-- A done 'simple' exercise is saved as a single workout_sets row
-- (set_number 1, weight, reps/rpe null). Edited on /program. Safe to re-run.

alter table workout_days add column if not exists log_style text not null default 'sets';

alter table workout_days drop constraint if exists workout_days_log_style_check;
alter table workout_days add constraint workout_days_log_style_check check (log_style in ('sets', 'simple'));

update workout_days set log_style = 'simple' where id = 'kb_circuit';
