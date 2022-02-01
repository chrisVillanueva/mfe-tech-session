import React from "react";
import ReactDOM from "react-dom";
import "./index.scss";

/**
 * Background processing
*/
const queuedFunction = (funcPromise) => {
  let queueFunc = null;
  const queue = [];
  let pending = false;

  return (msg) => {
    if (queueFunc) {
      queueFunc(msg);
    } 
    else {
      queue.push(msg);

      if (!pending) {
        pending = true;
        funcPromise
          .then((func) => {
            queueFunc = func;
            queue.forEach(queueFunc);
            queue = [];
          })
          .catch((err) => console.log(
            `SHELL: Error getting queued function`
          ));
      }
    }
  };
};

const sendAnalytics = queuedFunction(
  import("logic/analyticsFunc")
    .then(
      ({ default: func }) => func
    )
    .catch(e => 
      console.log(
        `SHELL: Error fetching analyticsFunc => ${e}`
      )
    )
);

const newClassObject = (...args) =>
  import("logic/classExport")
    .then(
      ({ default: classRef }) => {
        return new classRef(...args);
    })
    .catch((err) => 
      console.log(
        `SHELL: Error fetching class => ${err}`
      )
    );

newClassObject("classExport constructor value")
  .then((theObject) => {
    theObject.logString();
  });

sendAnalytics("SHELL: Application startup");


/**
 * UI Components
*/
const SingleValue = () => {
  const [singleValue, singleValueSet] = React.useState(null);
  React.useEffect(() => {
    import("logic/singleValue")
      .then(
        ({ default: value }) => singleValueSet(value)
      )
      .catch((err) => 
        console.error(`SHELL:  Error getting single value => ${err}`)
      );
  }, []);

  return (
    <div>
      <p>
        <label>Single value:</label> 
        {singleValue}.
      </p>
    </div>
  );
};

const ArrayValue = () => {
  const [arrayValue, arrayValueSet] = React.useState(null);
  React.useEffect(() => {
    import("logic/arrayValue")
      .then(
        ({ default: value }) => arrayValueSet(value)
      )
      .catch((err) => 
        console.error(`SHELL: Error getting array value => ${err}`)
      );
  }, []);

  return (
    <div>
      <label>Array value:</label> 
      {JSON.stringify(arrayValue)}.
    </div>
  );
};

const ObjectValue = () => {
  const [objectValue, objectValueSet] = React.useState(null);
  React.useEffect(() => {
    import("logic/objectValue")
      .then(
        ({ default: value }) => { 
          objectValueSet(value); 
          return value 
      })
      .catch((err) => 
        console.error(`SHELL: Error getting object value => ${err}`)
      );
  }, []);
  let uiConfig = (objectValue) ? objectValue : {};
  return (
    <div style={{
      color:`${(uiConfig.paper) ? uiConfig.paper.color : 'inherit'}`,
      fontWeight: `${(uiConfig.paper) ? uiConfig.paper.fontWeight : 'inherit'}`,
      fontSize: `${(uiConfig.paper) ? uiConfig.paper.fontSize : 'inherit'}`
    }}>
      <p>
        <label>JSON value:</label>  
      </p>
      <pre>
        {JSON.stringify(uiConfig, null, 2)}
      </pre>
    </div>
  );
};

const App = () => {
  sendAnalytics("SHELL: Rendering UI");
  return (
    <div className="mt-10 text-3xl mx-auto max-w-6xl">
      <SingleValue />
      <hr />
      <ArrayValue />
      <hr />
      <ObjectValue />
    </div>
  );
};

ReactDOM.render(
  <App />, 
  document.getElementById("app")
);
