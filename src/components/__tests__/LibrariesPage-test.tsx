import { expect } from "chai";
import * as Sinon from "sinon";
import * as Enzyme from "enzyme";
import * as React from "react";
import buildStore from "../../store";

import { testLibrary1, testLibrary2, modifyLibrary } from "./TestUtils";
import { LibrariesPage } from "../LibrariesPage";
import LibrariesList from "../LibrariesList";
import Toggle from "../reusables/Toggle";
import SearchForm from "../SearchForm";
import Form from "../reusables/Form";

describe("LibrariesPage", () => {
  const libraries = [
    modifyLibrary(testLibrary1, {registry_stage: "production"}),
    modifyLibrary(testLibrary2, {registry_stage: "production"})
  ];

  let qaLib = {
    uuid: "UUID3",
    basic_info: {
      "name": "QA Library",
      "short_name": "qa",
    },
    urls_and_contact: {
      "authentication_url": "qaURL",
      "contact_email": "qaEmail",
      "opds_url": "qaOpds",
      "web_url": "qaWeb"
    },
    stages: {
      "library_stage": "testing",
      "registry_stage": "testing"
    },
    areas: {
      "focus": [],
      "service": []
    }
  };

  let fetchData;
  let fetchQA;
  let search;
  let wrapper: Enzyme.CommonWrapper<{}, {}, {}>;
  let store;

  beforeEach(() => {
    fetchData = Sinon.stub();
    fetchQA = Sinon.stub();
    search = Sinon.stub().returns(libraries[1]);
    store = buildStore();
    wrapper = Enzyme.mount(
      <LibrariesPage
        store={store}
        fetchData={fetchData}
        fetchQA={fetchQA}
        search={search}
        libraries={{libraries}}
      />
    );
  });

  it("should call fetchData on load", () => {
    expect(fetchData.callCount).to.equal(1);
  });

  it("should display a toggle", () => {
    expect(wrapper.state()["qa"]).to.be.false;
    let toggle = wrapper.find(Toggle);
    expect(toggle.length).to.equal(1);
    expect(toggle.text()).to.equal("QA Mode: Off");
    expect(toggle.prop("initialOn")).to.be.false;

    wrapper.setState({ "qa": true });

    toggle = wrapper.find(Toggle);
    expect(toggle.prop("initialOn")).to.be.true;
    expect(toggle.text()).to.equal("QA Mode: On");
  });

  it("should toggle", async () => {
    expect(fetchData.callCount).to.equal(1);
    expect(fetchQA.callCount).to.equal(0);
    expect(wrapper.state()["qa"]).to.be.false;
    expect(wrapper.find(Toggle).prop("initialOn")).to.be.false;

    await wrapper.instance().toggleQA(true);
    wrapper.update();

    expect(fetchData.callCount).to.equal(1);
    expect(fetchQA.callCount).to.equal(1);
    expect(wrapper.state()["qa"]).to.be.true;
    expect(wrapper.find(Toggle).prop("initialOn")).to.be.true;

    wrapper.setProps({ libraries: { libraries: libraries.concat(qaLib) }});

    // We already have the production list once, so we don't need another server call.
    await wrapper.instance().toggleQA(false);
    wrapper.update();

    expect(fetchData.callCount).to.equal(1);
    expect(fetchQA.callCount).to.equal(1);
    expect(wrapper.state()["qa"]).to.be.false;
    expect(wrapper.find(Toggle).prop("initialOn")).to.be.false;

    // We've already loaded the QA list once, so we don't have to get it from the server again.
    await wrapper.instance().toggleQA(true);
    wrapper.update();

    expect(fetchData.callCount).to.equal(1);
    expect(fetchQA.callCount).to.equal(1);
    expect(wrapper.state()["qa"]).to.be.true;
    expect(wrapper.find(Toggle).prop("initialOn")).to.be.true;
  });

  it("should display a search form", () => {
    expect(wrapper.render().hasClass("libraries-page")).to.be.true;
    let searchForm = wrapper.find(SearchForm);
    expect(searchForm.length).to.equal(1);
    expect(searchForm.find(".panel-title").text()).to.equal("Search for a library by name");
    expect(searchForm.find(".btn").length).to.equal(1);
    wrapper.setState({ showAll: false });

    searchForm = wrapper.find(SearchForm);
    // The "Clear search" button is showing now.
    expect(searchForm.find(".btn").length).to.equal(2);
  });

  it("should search", async() => {
    let form = wrapper.find(Form).at(0);
    const libraryPageSearch = () => {
      wrapper.setState({ showAll: false });
      search();
    };
    let formSubmit = Sinon.stub(form.instance(), "submit").callsFake(libraryPageSearch);
    let spyClear = Sinon.spy(wrapper.instance(), "clear");

    expect(wrapper.state()["showAll"]).to.be.true;
    wrapper.find(".panel-info").find("input").simulate("change", {target: {value: "test_search_term"}});
    wrapper.find(".panel-info form .btn").simulate("click");
  });

  it("shouldn't display QA search results unless in QA mode", async () => {
    wrapper.setProps({ results: { libraries: [qaLib] } });
    wrapper.setState({ searchTerm: "QA Library", showAll: false });
    let results = wrapper.find(".panel-warning");
    expect(results.length).to.equal(0);

    wrapper.setState({...wrapper.state(), ...{qa: true}});

    results = wrapper.find(".panel-warning");
    expect(results.length).to.equal(1);
    expect(results.find(".panel-title").text()).to.equal("QA Library (qa)");
  });

  it("should let the user check QA if the production search was unsuccessful", async () => {
    expect(search.callCount).to.equal(0);
    wrapper.setState({ searchTerm: "QA Library"});
    await wrapper.instance().toggleQA(true);

    expect(search.callCount).to.equal(1);
    expect(search.args[0][0].get("name")).to.equal("QA Library");
  });

  it("should display a list", () => {
    let list = wrapper.find(LibrariesList);
    expect(list.length).to.equal(1);
    // All libraries:
    expect(list.prop("libraries")).to.eql(wrapper.prop("libraries").libraries);

    // Successful search:
    wrapper.setState({ showAll: false });
    wrapper.setProps({ results: { libraries: [libraries[1]] } });

    list = wrapper.find(LibrariesList);
    expect(list.prop("libraries")).to.eql(wrapper.prop("results").libraries);
    // Clear the search results:
    wrapper.setState({ showAll: true });

    list = wrapper.find(LibrariesList);
    expect(list.prop("libraries")).to.eql(wrapper.prop("libraries").libraries);

    // Unsuccessful search:
    wrapper.setState({ showAll: false });
    wrapper.setProps({ results: null });
    list = wrapper.find(LibrariesList);
    expect(list.prop("libraries")).to.eql([]);
    // Clear the search results:
    wrapper.setState({ showAll: true });
    list = wrapper.find(LibrariesList);
    expect(list.prop("libraries")).to.eql(wrapper.prop("libraries").libraries);

     // No libraries:
     wrapper.setProps({ libraries: [] });
     list = wrapper.find(LibrariesList);
     expect(list.prop("libraries")).to.be.undefined;
  });

  it("should render changes to a library", () => {
    let updatedLibrary = {...libraries[0], stages: {"library_stage": "testing", "registry_stage": "testing"}};
    let spyUpdateLibraryList = Sinon.spy(wrapper.instance(), "updateLibraryList");
    expect(spyUpdateLibraryList.callCount).to.equal(0);
    // There are two production libraries to display.
    expect(wrapper.find(".list .panel").length).to.equal(2);

    wrapper.setProps({ updatedLibrary });

    expect(spyUpdateLibraryList.callCount).to.equal(1);
    expect(spyUpdateLibraryList.args[0][0]).to.eql(libraries);
    expect(spyUpdateLibraryList.returnValues[0]).to.eql([updatedLibrary, libraries[1]]);
    // The library we edited has been hidden; there is only one production library to display.
    expect(wrapper.find(".list .panel").length).to.equal(1);

    spyUpdateLibraryList.restore();
  });

  it("should render changes to a search result", () => {
    // Use case: admin searched for a library and then edited its stages.  Changes should be reflected immediately.
    let updatedLibrary = {...libraries[0], stages: {"library_stage": "testing", "registry_stage": "testing"}};
    wrapper.setState({ showAll: false });
    let spyUpdateLibraryList = Sinon.spy(wrapper.instance(), "updateLibraryList");
    expect(spyUpdateLibraryList.callCount).to.equal(0);

    wrapper.setProps({ updatedLibrary, results: { libraries: [libraries[0]] } });

    expect(spyUpdateLibraryList.callCount).to.equal(2);
    expect(spyUpdateLibraryList.getCall(1).args[0][0]).to.equal(libraries[0]);
    expect(spyUpdateLibraryList.returnValues[1][0]).to.equal(updatedLibrary);

    spyUpdateLibraryList.restore();
  });

});