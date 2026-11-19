import React from "react";

function SafetyGuide() {
  return (
    <section className="section" id="safety">
      <h2>Earthquake Safety Guide</h2>

      <p className="section-description">
        Learn how to protect yourself before, during and after an earthquake.
      </p>

      <div className="safety-grid">

        <div className="safety-card">
          <h3>Before an Earthquake</h3>
          <p>
            Prepare an emergency kit, identify safe places
            and create an emergency family plan.
          </p>
        </div>

        <div className="safety-card">
          <h3>During an Earthquake</h3>
          <p>
            Drop, Cover and Hold On. Stay away from windows
            and protect your head and neck.
          </p>
        </div>

        <div className="safety-card">
          <h3>After an Earthquake</h3>
          <p>
            Check for injuries, avoid damaged buildings
            and follow official emergency instructions.
          </p>
        </div>

      </div>
    </section>
  );
}

export default SafetyGuide;