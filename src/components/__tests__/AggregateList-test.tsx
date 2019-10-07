import { expect } from "chai";
import * as Sinon from "sinon";
import * as Enzyme from "enzyme";
import * as React from "react";
import { testLibrary1, testLibrary2, modifyLibrary } from "./TestUtils";
import AggregateList from "../AggregateList";

describe("AggregateList", () => {
  let wrapper;
  let data;
  let productionLibrary1 = modifyLibrary(testLibrary1, { "name": "Production Library 1", "registry_stage": "production" });
  let productionLibrary2 = modifyLibrary(productionLibrary1, { "name": "Production Library 2" });
  beforeEach(() => {
    data = {
      "production": [productionLibrary1, productionLibrary2],
      "testing": [testLibrary1],
      "cancelled": [testLibrary2]
    };
    wrapper = Enzyme.mount(<AggregateList data={data} />);
  });
  let getNumber = (name, dataset) => {
    return dataset[name.toLowerCase()].length;
  };
  it("displays information for each category", () => {
    let categories = wrapper.find(".stats-category");
    expect(categories.length).to.equal(3);
    ["Production", "Testing", "Cancelled"].forEach((name, idx) => {
      let infoBar = categories.at(idx).find(".stats-category-name");
      expect(infoBar.find("span").at(0).text()).to.equal(`${name}: ${getNumber(name, data)}`);
      expect(infoBar.find("span").at(1).text()).to.equal(
        ` (${(getNumber(name, data) / 4 * 100)}%)`
      );
    });
    });
  it("rounds percentages to integers", () => {
    let newData = {...data, ...{"cancelled": []}};
    wrapper.setProps({ data: newData });
    let categories = wrapper.find(".stats-category");
    ["Production", "Testing", "Cancelled"].forEach((name, idx) => {
      let infoBar = categories.at(idx).find(".stats-category-name");
      expect(infoBar.find("span").at(0).text()).to.equal(`${name}: ${getNumber(name, newData)}`);
      expect(infoBar.find("span").at(1).text()).to.equal(
        ` (${Math.round((getNumber(name, newData) / 3) * 100)}%)`
      );
    });
  });
  it("optionally shows a list of library names under each category", () => {
    expect(wrapper.state()["expanded"]).to.be.false;
    let nameLists = wrapper.find(".inner-stats-list");
    expect(nameLists.length).to.equal(0);
    wrapper.setState({ expanded: true });
    nameLists = wrapper.find(".inner-stats-list");
    expect(nameLists.length).to.equal(3);
    expect(nameLists.at(0).text()).to.contain("Production Library 1");
    expect(nameLists.at(0).text()).to.contain("Production Library 2");
    expect(nameLists.at(1).text()).to.contain("Test Library 1");
    expect(nameLists.at(2).text()).to.contain("Test Library 2");
  });
  it("has a button to toggle the list of library names", () => {
    expect(wrapper.state()["expanded"]).to.be.false;
    let spyToggleExpanded = Sinon.spy(wrapper.instance(), "toggleExpanded");
    wrapper.setProps({ toggleExpanded: spyToggleExpanded });
    expect(spyToggleExpanded.callCount).to.equal(0);
    let button = wrapper.find(".list-view").find("button").at(1);
    expect(button.text()).to.equal("Show Library Names");
    button.simulate("click");
    expect(wrapper.state()["expanded"]).to.be.true;
    expect(spyToggleExpanded.callCount).to.equal(1);
    expect(button.text()).to.equal("Hide Library Names");
    spyToggleExpanded.restore();
  });
  it("has a button to toggle the formatting", () => {
    wrapper.setState({ "expanded": true });
    expect(wrapper.state()["styled"]).to.be.true;
    let spyToggleFormatting = Sinon.spy(wrapper.instance(), "toggleFormatting");
    wrapper.setProps({ toggleFormatting: spyToggleFormatting });
    expect(spyToggleFormatting.callCount).to.equal(0);
    let categoryListItems = wrapper.find(".stats-list").children();
    expect(categoryListItems.length).to.equal(3);
    categoryListItems.forEach((item) => {
      expect(item.hasClass("stats-category")).to.be.true;
      expect(item.find("section").hasClass("stats-category-name")).to.be.true;
      expect(item.find("ul").hasClass("inner-stats-list")).to.be.true;
    });
    let button = wrapper.find(".list-view").find("button").at(0);
    expect(button.text()).to.equal("Remove Formatting");
    button.simulate("click");
    expect(spyToggleFormatting.callCount).to.equal(1);
    expect(wrapper.state()["styled"]).to.be.false;
    button = wrapper.find(".list-view").find("button").at(0);
    expect(button.text()).to.equal("Restore Formatting");
    categoryListItems = wrapper.find(".stats-list").children();
    expect(categoryListItems.length).to.equal(3);
    categoryListItems.forEach((item) => {
      expect(item.hasClass("stats-category")).to.be.false;
      expect(item.find("section").hasClass("stats-category-name")).to.be.false;
      expect(item.find("ul").hasClass("inner-stats-list")).to.be.false;
    });
    spyToggleFormatting.restore();
  });
  it("has a button to copy the data to the clipboard", () => {
    let copy = Sinon.stub(wrapper.instance(), "copy");
    wrapper.setProps({ copy });
    expect(wrapper.state()["copied"]).to.be.false;
    expect(copy.callCount).to.equal(0);
    let button = wrapper.find(".list-view").find("button").at(2);
    expect(button.text()).to.equal("Copy Data");
    button.simulate("click");
    expect(copy.callCount).to.equal(1);
    wrapper.setState({ copied: true });
    button = wrapper.find(".list-view").find("button").at(2);
    expect(button.text()).to.equal("Copy Data Again");
    copy.restore();
  });
  it("confirms that the data has been copied to the clipboard", () => {
    expect(wrapper.state()["showConfirm"]).to.be.false;
    let copyConfirm = wrapper.find(".copy-confirmation");
    expect(copyConfirm.length).to.equal(1);
    expect(copyConfirm.hasClass("visible")).to.be.false;
    wrapper.setState({ showConfirm: true });
    copyConfirm = wrapper.find(".copy-confirmation");
    expect(copyConfirm.length).to.equal(1);
    expect(copyConfirm.hasClass("visible")).to.be.true;
    expect(copyConfirm.text()).to.equal("Copied to clipboard");
    wrapper.instance().hideConfirm();
    wrapper.update();
    expect(wrapper.state()["showConfirm"]).to.be.false;
    copyConfirm = wrapper.find(".copy-confirmation");
    expect(copyConfirm.length).to.equal(1);
    expect(copyConfirm.hasClass("visible")).to.be.false;
  });
});
