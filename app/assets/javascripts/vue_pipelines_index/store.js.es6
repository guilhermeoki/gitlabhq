/* global gl, Flash */
/* eslint-disable no-param-reassign */

((gl) => {
  const PAGINATION_LIMIT = 31;
  const SLICE_LIMIT = 29;

  class RealtimePaginationUpdater {
    constructor(pageData) {
      this.pageData = pageData;
    }

    updatePageDiff(apiResponse) {
      const diffData = this.pageData.slice(0);
      apiResponse.pipelines.forEach((newPipe, i) => {
        if (newPipe.commit) {
          diffData.unshift(newPipe);
        } else {
          const newMerge = Object.assign({}, diffData[i], newPipe);
          diffData[i] = newMerge;
        }
      });
      if (diffData.length < PAGINATION_LIMIT) return diffData;
      return diffData.slice(0, SLICE_LIMIT);
    }
  }

  gl.PipelineStore = class {
    fetchDataLoop(Vue, pageNum, url) {
      const setVueResources = () => { Vue.activeResources = 1; };
      const resetVueResources = () => { Vue.activeResources = 0; };
      const addToVueResources = () => { Vue.activeResources += 1; };
      const subtractFromVueResources = () => { Vue.activeResources -= 1; };

      resetVueResources(); // set Vue.resources to 0

      const updatePipelineNums = (count) => {
        const { all } = count;
        // cannot define non camel case, so not using destructuring for running
        const running = count.running_or_pending;
        document.querySelector('.js-totalbuilds-count').innerHTML = all;
        document.querySelector('.js-running-count').innerHTML = running;
      };

      const resourceChecker = () => {
        if (Vue.activeResources === 0) {
          setVueResources();
        } else {
          addToVueResources();
        }
      };

      const goFetch = () =>
        this.$http.get(`${url}?page=${pageNum}`)
          .then((response) => {
            const res = JSON.parse(response.body);
            Vue.set(this, 'updatedAt', res.updated_at);
            Vue.set(this, 'pipelines', res.pipelines);
            Vue.set(this, 'count', res.count);
            updatePipelineNums(this.count);
            this.pageRequest = false;
            subtractFromVueResources();
          }, () => new Flash(
            'Something went wrong on our end.'
          ));

      const goUpdate = () =>
        this.$http.get(`${url}?page=${pageNum}&updated_at=${this.updatedAt}`)
          .then((response) => {
            const res = JSON.parse(response.body);
            const p = new RealtimePaginationUpdater(this.pipelines);
            Vue.set(this, 'updatedAt', res.updated_at);
            Vue.set(this, 'pipelines', p.updatePageDiff(res));
            Vue.set(this, 'count', res.count);
            updatePipelineNums(this.count);
            subtractFromVueResources();
          }, () => new Flash(
            'Something went wrong on our end.'
          ));

      resourceChecker();
      goFetch();

      this.intervalId = setInterval(() => {
        if (this.updatedAt) {
          resourceChecker();
          if (Vue.activeResources > 1) return;
          goUpdate();
        }
      }, 3000);

      window.onbeforeunload = function removePipelineInterval() {
        clearInterval(this.intervalId);
      };
    }
  };
})(window.gl || (window.gl = {}));
