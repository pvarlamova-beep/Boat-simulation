export interface SimulationConfig {
  boatSpeed: number; // m/s
  riverSpeed: number; // m/s
  angle: number; // degrees (0 is downstream, 90 is straight across)
  simSpeed: number; // multiplier
  showVectors: boolean;
  showTrajectory: boolean;
  showComponents: boolean;
}

export interface SimulationStats {
  time: number;
  displacementX: number;
  displacementY: number;
  isFinished: boolean;
}

export const INITIAL_CONFIG: SimulationConfig = {
  boatSpeed: 5,
  riverSpeed: 2,
  angle: 90,
  simSpeed: 1,
  showVectors: true,
  showTrajectory: true,
  showComponents: false,
};
