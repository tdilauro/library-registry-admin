import { expect } from "chai";
import { stub } from "sinon";
import * as Enzyme from "enzyme";
import * as React from "react";
import Form from "../Form";
import SubmitButton from "../SubmitButton";

describe("Form", () => {
  let wrapper: Enzyme.CommonWrapper<any, any, {}>;
  let content: Array<JSX.Element>;
  let element1: JSX.Element;
  let element2: JSX.Element;
  let hiddenName = "hidden name";
  let hiddenValue = "hidden value";
  let onSubmit = stub();

  beforeEach(() => {
    element1 = <input type="text" name="Element1" defaultValue="element1"/>;
    element2 = <select name="Element2">
                  <option value="abc">ABC</option>
                  <option value="xyz">XYZ</option>
                </select>;

    wrapper = Enzyme.mount(
      <Form
        content={[element1, element2]}
        hiddenName={hiddenName}
        hiddenValue={hiddenValue}
        onSubmit={onSubmit}
      />
    );
  });

  it("should render a hidden input field", () => {
    let hidden = wrapper.find("[type='hidden']");
    expect(hidden.length).to.equal(1);
    expect(hidden.props().name).to.equal("hidden name");
    expect(hidden.props().value).to.equal("hidden value");
  });

  it("should render elements", () => {
    let input = wrapper.find("input").at(1);
    expect(input.length).to.equal(1);
    expect(input.props().type).to.equal("text");
    expect(input.props().name).to.equal("Element1");

    let select = wrapper.find("select");
    expect(select.length).to.equal(1);
    expect(select.props().name).to.equal("Element2");
    expect(select.find("option").length).to.equal(2);
  });

  it("should render a SubmitButton", () => {
    let button = wrapper.find("SubmitButton");
    expect(button.length).to.equal(1);
    expect(button.props()["submit"]).to.equal(wrapper.instance()["save"]);
  });

  it("should call the onSave prop", () => {
    let button = wrapper.find("SubmitButton");
    button.simulate("click");
    expect(onSubmit.callCount).to.equal(1);

    let data = onSubmit.args[0][0];
    expect(data.get("Element1")).to.equal("element1");
    expect(data.get("Element2")).to.equal("abc");
  });
});
