import React from "react";

export default function InputPanel({
  baseHeight,
  setBaseHeight,
  topHeight,
  setTopHeight,
  stepCount,
  setStepCount,
  toleranceWidth,
  setToleranceWidth,
}) {
  return (
    <div id="geo-route-panel">
      <span className="geo-route-row">
        <p className="text-info mb-0">Base Height</p>
        <div className="custom-input-group input-group input-group-sm">
          <div className="input-group-prepend">
            <button
              className="geo-btn add-anime-blue btn btn-primary text-info"
              onClick={() => setBaseHeight(Math.max(0, baseHeight - 1))}
            >
              <i className="fa fa-minus"></i>
            </button>
            <div className="btn btn-info disabled text-primary opac">
              <i className="geo-icons fa fa-fw fa-arrow-up-from-bracket"></i>
            </div>
          </div>
          <input
            id="user-base-height"
            min="0"
            value={baseHeight}
            onChange={(e) => setBaseHeight(Number(e.target.value))}
            className="geo-input-el px-0 text-center form-control text-info bg-primary border-0"
          />
          <div className="input-group-append">
            <button
              className="geo-btn add-anime-blue btn btn-primary text-info"
              onClick={() => setBaseHeight(baseHeight + 1)}
            >
              <i className="fas fa-plus"></i>
            </button>
          </div>
        </div>
      </span>
      <span className="geo-route-row">
        <p className="text-info mb-0">Top Height</p>
        <div className="custom-input-group input-group input-group-sm">
          <div className="input-group-prepend">
            <button
              className="geo-btn add-anime-blue btn btn-primary text-info"
              onClick={() => setTopHeight(Math.max(1, topHeight - 1))}
            >
              <i className="fa fa-minus"></i>
            </button>
            <div className="btn btn-info disabled text-primary opac">
              <i className="geo-icons fa fa-fw fa-arrows-up-to-line"></i>
            </div>
          </div>
          <input
            id="user-top-height"
            min="1"
            value={topHeight}
            onChange={(e) => setTopHeight(Number(e.target.value))}
            className="geo-input-el px-0 text-center form-control text-info bg-primary border-0"
          />
          <div className="input-group-append">
            <button
              className="geo-btn add-anime-blue btn btn-primary text-info py-0"
              onClick={() => setTopHeight(topHeight + 1)}
            >
              <i className="fas fa-plus"></i>
            </button>
          </div>
        </div>
      </span>
      <span className="geo-route-row">
        <p className="text-success mb-0">Step Count</p>
        <div className="custom-input-group input-group input-group-sm">
          <div className="input-group-prepend">
            <button
              className="geo-btn add-anime btn btn-primary text-success"
              onClick={() => setStepCount(Math.max(1, stepCount - 1))}
            >
              <i className="fa fa-minus"></i>
            </button>
            <div className="btn btn-success disabled text-primary opac">
              <i className="geo-icons fa fa-fw fa-arrows-turn-to-dots"></i>
            </div>
          </div>
          <input
            id="user-step-count"
            min="1"
            value={stepCount}
            onChange={(e) => setStepCount(Number(e.target.value))}
            className="geo-input-el px-0 text-center form-control text-success bg-primary border-0"
          />
          <div className="input-group-append">
            <button
              className="geo-btn add-anime btn btn-primary text-success"
              onClick={() => setStepCount(stepCount + 1)}
            >
              <i className="fas fa-plus"></i>
            </button>
          </div>
        </div>
      </span>
      <span className="geo-route-row">
        <p className="text-success mb-0">Tolerance Width</p>
        <div className="custom-input-group input-group input-group-sm">
          <div className="input-group-prepend">
            <button
              className="geo-btn add-anime btn btn-primary text-success btn-sm"
              onClick={() => setToleranceWidth(Math.max(1, toleranceWidth - 1))}
            >
              <i className="fa fa-minus"></i>
            </button>
            <div className="btn btn-success disabled text-primary opac">
              <i className="geo-icons fa fa-fw fa-text-width"></i>
            </div>
          </div>
          <input
            id="user-tolerance-w"
            min="1"
            value={toleranceWidth}
            onChange={(e) => setToleranceWidth(Number(e.target.value))}
            className="geo-input-el px-0 text-center form-control text-success bg-primary border-0"
          />
          <div className="input-group-append">
            <button
              className="geo-btn add-anime btn btn-primary text-success"
              onClick={() => setToleranceWidth(toleranceWidth + 1)}
            >
              <i className="fas fa-plus"></i>
            </button>
          </div>
        </div>
      </span>
    </div>
  );
}
